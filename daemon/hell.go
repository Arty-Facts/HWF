package main

import (
	//"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/gorilla/websocket"

	message "test.com/test"
)

var open_files map[string]*os.File

type file_data struct {
	filename string
	path     string

	downloaded bool
}

type stage struct {
	name     string
	data     []file_data
	cmd_list []cmd

	track_time bool
	track_ram  bool
	track_cpu  bool
	track_gpu  bool

	comment string
}

type cmd struct {
	command string

	status_code int
	std_err     []byte
	output      []byte

	executed       bool
	execution_time int64
}

type task struct {
	stages    []stage
	artifacts []string

	ready_to_execute bool
	total_time       int64
}

var current_task task

var connectiongrabben *websocket.Conn

func send_text_message(connection *websocket.Conn, msg []byte) {
	connection.WriteMessage(websocket.TextMessage, msg)
}

func send_binary_message(connection *websocket.Conn, msg []byte) {
	connection.WriteMessage(websocket.BinaryMessage, msg)
}

func send_hardware() {
	send_binary_message(connectiongrabben, Build_hardware())
	fmt.Println("[Daemon]: Hardware specs sent to Hub.\n")
}

func send_results() {
	send_binary_message(connectiongrabben, Build_results(&current_task))
	fmt.Println("[Daemon]: Results sent to Hub.")
}

//connect to the server via websockets
func connect() *websocket.Conn {
	// u := url.URL{
	// 	Scheme: "ws",
	// 	Host:   os.Getenv("HWF_SERVER_URL"),
	// 	Path:   "/",
	// }
		fmt.Println("[Daemon]: Connecting to Hub...")
	server_url := "ws://localhost:9000" //os.Getenv("HWF_SERVER_URL")
	//server_url := "ws://localhost:9000"

	docker_server_url := os.Getenv("HWF_SERVER_URL")
	if len(docker_server_url) > 1 {
		server_url = docker_server_url + "?os=windows11&gpu=rtx4090&cpu=r9_9999x&ram=400gb"
	}

	// if os.Getenv("HWF_SERVER_URL") {
	// 	server_url := "localhost:9000"
	// }

	// hell.go:7:1: expected 'STRING', found '<<'

	connection, _, err := websocket.DefaultDialer.Dial(server_url, nil)
	if err != nil {
		log.Fatal(err)
	}

	connectiongrabben = connection
	fmt.Println("[Daemon]: Connected!")
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
		// if received_bytes contains something
		case data := <-received_bytes:
			read_message(data)

		// if we got an error during read
		case err := <-errCh:
			fmt.Println(err)
			break
		}
	}
}

func main() {

	// init the map for all open output files
	open_files = make(map[string]*os.File)

	connection := connect()

	// close connection once we go out of scope
	defer connection.Close()

	// send hardware to hub
	send_hardware()

	// wait for requests from server
	listen(connection)
}

func run_task() {
	fmt.Println("\n[Daemon]: Task started.\n")
	var curr_cmd *cmd

	for i := 0; i < len(current_task.stages); i++ {
		fmt.Println("[Daemon]: Stage started [" + string(current_task.stages[i].name) + "]")
		for j := 0; j < len(current_task.stages[i].cmd_list); j++ {
			fmt.Println("[Daemon]: Executing command [" + current_task.stages[i].cmd_list[j].command + "]")
			curr_cmd = &current_task.stages[i].cmd_list[j]

			time_before := time.Now().Unix()
			out, err, status_code := execute_command(curr_cmd.command)

			// update current cmd struct
			curr_cmd.execution_time = time.Now().Unix() - time_before
			current_task.total_time += curr_cmd.execution_time
			curr_cmd.output = out
			curr_cmd.std_err = err
			curr_cmd.status_code = status_code
			curr_cmd.executed = true

			// debug prints:
			//fmt.Println("<output: " + string(out) + ">")
			//if err != nil {
			if len(err) > 0 {
				fmt.Println("[Daemon]: Error " + string(err) + ">")
				fmt.Println("[Daemon]: Status code: " + string(status_code) + ">")
			}
		}
		fmt.Println("")	
	}
	
	//debug_print_current_task()
	fmt.Println("[Daemon]: Task done.\n")
	send_results()
}

func execute_command(command string) ([]byte, []byte, int) {
	cmd := exec.Command("bash", "-c", command)

	status_code := 0
	std_err := []byte("")

	out, err := cmd.Output()

	if err != nil {
		exitError, ok := err.(*exec.ExitError)
		fmt.Println(exitError, ok)

		status_code = exitError.ExitCode()
		std_err = exitError.Stderr
	}

	return out, std_err, status_code
}

func read_message(msg []byte) {

	// right now execute_command is the only
	// function that can panic, so we know that's
	// where the error was caused - change this later
	// if more panics were added
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("[Daemon]: Panic while executing command:", r)
		}
	}()

	fb_msg := message.GetRootAsMessage(msg, 0)

	switch msgType := fb_msg.Type(); msgType {
	case 1:
		fmt.Println("\n[Daemon]: Task received.")
		
		current_task = Read_task(fb_msg)
		//debug_print_current_task()
		break
	case 4:
		saveFile(Read_file(fb_msg))
		break
	}
}

func debug_print_current_task() {
	fmt.Println("[Daemon]: DEBUG PRINT CURRENT TASK")
	fmt.Println(current_task)

	fmt.Println("[Daemon]: Artifacts:")
	fmt.Println(current_task.artifacts)

	for i := 0; i < len(current_task.stages); i++ {
		fmt.Println("[Daemon]: Stage", i)
		stage := current_task.stages[i]
		fmt.Println(stage.name)
		fmt.Println(stage.cmd_list)
		fmt.Println(stage.data)
	}
}

// returns an open file or opens new file instead
func getOutputFile(filename string) *os.File {
	output_file, opened := open_files[filename]

	if !opened {
		output_file, err := os.OpenFile(string(filename), os.O_TRUNC|os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

		if err != nil {
			log.Fatal(err)
		} else {
			// save the opened file to the map
			open_files[filename] = output_file
			return output_file
		}
	}

	return output_file
}

func saveFile(msgFile *message.File) {
	filename := msgFile.Filename()
	//packetnr := msgFile.Packetnumber()
	eof := msgFile.Eof()
	
	//fmt.Println(string(filename), packetnr, eof)

	// save file to disk
	arr := msgFile.DataBytes()

	// save arr to output file
	output_file := getOutputFile(string(filename))
	if output_file == nil {
		fmt.Println("[Daemon]: big trouble idk")
	}

	if eof {
		output_file.Close()

		// remove the file from the opened files map
		delete(open_files, string(filename))

		// check if all files downloaded for stage
		if check_and_set_downloaded(string(filename)) {
			fmt.Println("[Daemon]: All required files received.")

			// we know all files are downloaded, it's a go time!!!!!!
			run_task()
		}

	} else {
		output_file.Write(arr)
	}
}

func check_and_set_downloaded(filename string) bool {
	downloaded_set := false
	status := true

	for i := 0; i < len(current_task.stages); i++ {
		for j := 0; j < len(current_task.stages[i].data); j++ {
			// check if we found the right data to set as downloaded
			if current_task.stages[i].data[j].filename == filename {
				current_task.stages[i].data[j].downloaded = true
				downloaded_set = true

				if !status {
					return false
				}

				// check if any data is still not downloaded
			} else if current_task.stages[i].data[j].downloaded == false {
				// stop checking if we are already done setting downloaded for "filename" data
				if downloaded_set {
					return false
				}
				status = false
			}
		}
	}

	return status
}
