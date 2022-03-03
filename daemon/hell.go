package main

import (
	//"context"
	"fmt"
	"log"
	"net/url"
	"os"

	flatbuffers "github.com/google/flatbuffers/go"
	"github.com/gorilla/websocket"
	message "test.com/test"
)

func connect() *websocket.Conn {
	u := url.URL{
		Scheme: "ws",
		Host:   "localhost:3000",
		Path:   "/",
	}
	connection, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal(err)
	}

	return connection
}

func listen(connection *websocket.Conn) {
	ch := make(chan []byte)
	errCh := make(chan error)

	go func(ch chan []byte, errCh chan error) {
		for {
			_, message, err := connection.ReadMessage()
			if err != nil {
				errCh <- err
			}
			ch <- message
		}
	}(ch, errCh)

	for {
		select {
		case data := <-ch:
			// if ch contains something
			fmt.Println(string(data))
			//build_message(data)

			// to-do: make sure server doesn't send something bad
			read_message(data)

		case err := <-errCh:
			// if we got an error during read
			fmt.Println(err)
			break
		}
	}
}

// gorilla websocket
func main() {
	connection := connect()

	// close connection once we go out of scope
	defer connection.Close()

	//var msg = []byte("hello world!")
	connection.WriteMessage(websocket.BinaryMessage, write_message("hello world!222"))
	//connection.WriteMessage(websocket.TextMessage, msg)

	listen(connection)
}

// what is param type for the data??
func read_message(msg []byte) {
	//test := data.GetRootAsHelloWorld(msg, 0)
	//fmt.Println(string(test.Msg()))
	test := message.GetRootAsMessage(msg, 0)

	// TO-DO:
	// get file from data somehow?
	// right now Data() returns int8?
	arr := test.Data(0)

	// create new file named hellgo.jpg
	f, err := os.Create("/hellgo.jpg")
	// check(err)
	if err != nil {
		// error handling
	}

	// write arr to the new file
	n, err := f.Write(arr)
	// check(err)
	if err != nil {
		// error handling
	}

	fmt.Printf("wrote %d bytes\n", n)

	// close file after this function returns
	defer f.Close()
	fmt.Println(string(test.Cmd()))
}

func write_message(msg string) []byte {
	builder := flatbuffers.NewBuilder(1024)
	hello := builder.CreateString(msg)

	//data.HelloWorldStart(builder)
	//data.HelloWorldAddMsg(builder, hello)
	//message := data.HelloWorldEnd(builder)

	message.MessageStart(builder)
	message.MessageAddAgentId(builder, 1)
	message.MessageAddCmd(builder, hello)
	binMsg := message.MessageEnd(builder)
	builder.Finish(binMsg)
	buf := builder.FinishedBytes()
	return buf
}

// WIP

// WIP
func run_daemon() {
	// to make a background thread?
	//ctx := context.Background()

}
