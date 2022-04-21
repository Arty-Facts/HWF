package main

import (
	//"context"
	"fmt"
	"log"
	"net/url"
	"os/exec"

	"github.com/gorilla/websocket"
	message "test.com/test"
)

//connect to the server via websockets
func connect() *websocket.Conn {
	u := url.URL{
		Scheme: "ws",
		Host:   "localhost:9000",
		Path:   "/",
	}
	connection, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal(err)
	}

	return connection
}

func listen(connection *websocket.Conn) {
	received_bytes := make(chan []byte)
	errCh := make(chan error)

	go func(received_bytes chan []byte, errCh chan error) {
		for {
			_, message, err := connection.ReadMessage()
			if err != nil {
				errCh <- err
			}
			received_bytes <- message
		}
	}(received_bytes, errCh)

	for {
		select {
		case data := <-received_bytes:
			// if received_bytes contains something

			send_message(connection, []byte("Received data, now processing..."))

			read_message(data)

			send_message(connection, []byte("Done reading data."))

		case err := <-errCh:
			// if we got an error during read
			fmt.Println(err)
			break
		}
	}
}

func main() {

	connection := connect()

	// close connection once we go out of scope
	defer connection.Close()

	// wait for requests from server
	listen(connection)

}

func send_message(connection *websocket.Conn, msg []byte) {
	connection.WriteMessage(websocket.TextMessage, msg)
}

func execute_command(command []byte) []byte {
	cmd := exec.Command("bash", "-c", string(command))

	out, err := cmd.Output()
	if err != nil {
		// log.Fatal(err)
		panic(err)
	}

	return out

	//https://zetcode.com/golang/exec-command/
}

func read_message(msg []byte) {

	// right now execute_command is the only
	// function that can panic, so we know that's
	// where the error was caused - change this later
	// if more panics were added
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Panic while executing command:", r)
		}
	}()

	msg := message.GetRootAsMessage(msg, 0)
	//var arr = make([]byte, test.DataLength())

	switch msgType := msg.Type(); msgType {
	case 1:
		read_task(msg)
	case 2:
		read_result(msg)
	case 3:
		read_hardwarepool(msg)
	case 4:
		read_file(msg)
	}

	/*
	// TASK
	if msgType == 1 {

		msgTask := test.Task(new(message.Task))
		msgStage := new(message.Stage)
		//msgStage :=
		msgTask.Stages(msgStage, 0)

		var results = make([][]byte, msgStage.CmdListLength())
		for i := 0; i < msgStage.CmdListLength(); i++ {
			fmt.Println(string(msgStage.CmdList(i)))
			result := execute_command(msgStage.CmdList(i))
			results[i] = result
		}

		for i, s := range results {
			fmt.Println(i, s)
		}

		// msgCmd := msgStage.CmdList(0)
		//msgStage.CmdList(new(message.CmdList), 0)
		// fmt.Println(string(msgCmd))
	}

	// GET_RESULT
	if msgType == 2 {

	}

	// GET_HARDWAREPOOL
	if msgType == 3 {
		
	}

	//FILE
	if msgType == 4 {
		
	}
	*/




	// save all bytes in Data array to arr
	// for i := 0; i < test.DataLength(); i++ {
	// 	arr[i] = byte(test.Data(i))
	// }

	// // save arr to file "hellgo.png"
	// err := ioutil.WriteFile("hellgo.png", arr, 0644)

	// DEBUG: print the contents of cmd
	// DEBUG: print the results

}

func read_task(msg *Message) {
	msgTask := msg.Task(new(message.Task))
	msgStage := new(message.Stage)

	msgTask.Stages(msgStage, 0) 

	// TO-DO: Wait before executing the commands!!!!
	// iterate over cmd and execute all commands
	var results = make([][]byte, msgStage.CmdListLength())
	for i := 0; i < msgStage.CmdListLength(); i++ {
		fmt.Println(string(msgStage.CmdList(i)))
		result := execute_command(msgStage.CmdList(i))
		results[i] = result
	}

	// print the results from cmd exec
	for i, s := range results {
		fmt.Println(i, s)
	}

}

// this function might be useless, don't think daemon is going to
// receive a message like this... :(
func read_hardwarepool(msg *Message) {
	msgHardware := msg.GetHardwarePool(new(message.GetHardwarePool))

	// TO-DO: use hardware info idk XD
	//fmt.Println(string(msgHardware.Hardware()))
	// print everyting in the hardware
	for i := 0; i < msgHardware.HardwareLength(); i++ {
		fmt.Println(string(msgHardware.Hardware(i)))
	}
}

func read_result(msg *Message) {
	msgResult := msg.GetResult(new(message.GetResult))

	// print everyting in the result
	for i := 0; i < msgResult.IdListLength(); i++ {
		fmt.Println(string(msgResult.IdList(i)))
	}
}

func read_file(msg *Message) {
	msgFile := msg.File(new(message.File))

	filename := msgFile.Filename()
	packetnr := msgFile.Packetnumber()
	eof := msgFile.Eof()

	// save file to disk
	arr := msgFile.DataBytes()

	// save arr to output file
	output_file, err := os.OpenFile(output_filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	if err != nil {
		log.Fatal(err)
	}

	output_file.Write(arr)

	output_file.Close()


}

// func write_message(msg string) []byte {

// 	builder := flatbuffers.NewBuilder(1024)
// 	hello := builder.CreateString(msg)
// 	hi := builder.CreateString("")

// 	message.MessageStart(builder)
// 	message.MessageAddAgentId(builder, hi)
// 	message.MessageAddCmd(builder, hello)
// 	binMsg := message.MessageEnd(builder)
// 	builder.Finish(binMsg)
// 	buf := builder.FinishedBytes()
// 	return buf
// }

// WIP

// WIP
func run_daemon() {
	// to make a background thread?
	//ctx := context.Background()

}
