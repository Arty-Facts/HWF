package main

import (
	//"context"
	"fmt"
	"log"
	"net/url"
	"os/exec"

	flatbuffers "github.com/google/flatbuffers/go"
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

	builder := flatbuffers.NewBuilder(1024)
	builder.CreateString("hi")

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

	test := message.GetRootAsMessage(msg, 0)
	//var arr = make([]byte, test.DataLength())

	msgType := test.Type()

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
	// save all bytes in Data array to arr
	// for i := 0; i < test.DataLength(); i++ {
	// 	arr[i] = byte(test.Data(i))
	// }

	// // save arr to file "hellgo.png"
	// err := ioutil.WriteFile("hellgo.png", arr, 0644)

	// DEBUG: print the contents of cmd
	// DEBUG: print the results

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
