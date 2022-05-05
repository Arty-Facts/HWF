package main

import (
	//"context"
	"fmt"
	"log"
	"os"
	"os/exec"

	flatbuffers "github.com/google/flatbuffers/go"
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
	cmd_list []string

	track_time bool
	track_ram  bool
	track_cpu  bool
	track_gpu  bool

	comment string
}

type task struct {
	stages    []stage
	artifacts []string

	ready_to_execute bool
}

var current_stage stage
var current_task task

//connect to the server via websockets
func connect() *websocket.Conn {
	// u := url.URL{
	// 	Scheme: "ws",
	// 	Host:   os.Getenv("HWF_SERVER_URL"),
	// 	Path:   "/",
	// }

	//server_url := "ws://localhost:9000?os=windows11&gpu=rtx4090&cpu=r9_9999x&ram=400gb"//os.Getenv("HWF_SERVER_URL")
	server_url := "ws://localhost:9000"

	docker_server_url := os.Getenv("HWF_SERVER_URL")
	if len(docker_server_url) > 1 {
		server_url = docker_server_url
	}

	// if os.Getenv("HWF_SERVER_URL") {
	// 	server_url := "localhost:9000"
	// }

	// hell.go:7:1: expected 'STRING', found '<<'

	connection, _, err := websocket.DefaultDialer.Dial(server_url, nil)
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

			//send_message(connection, []byte("Received data, now processing..."))

			read_message(data)

			//send_message(connection, []byte("Done reading data."))

		case err := <-errCh:
			// if we got an error during read
			fmt.Println(err)
			break
		}
	}
}

func main() {
	// init the map for all open output files
	open_files = make(map[string]*os.File)
	current_stage := 0

	// debug to remove compilation warning DELETE THIS
	fmt.Println(current_stage)

	connection := connect()

	// close connection once we go out of scope
	defer connection.Close()

	// wait for requests from server
	listen(connection)

}

func send_message(connection *websocket.Conn, msg []byte) {
	connection.WriteMessage(websocket.TextMessage, msg)
}

func run_task() {
	for i := 0; i < len(current_task.stages); i++ {
		for j := 0; j < len(current_task.stages[i].cmd_list); j++ {
			fmt.Println(string(execute_command(current_task.stages[i].cmd_list[j])))
		}
	}

	// to-do: return results from execution

}

func execute_command(command string) []byte {
	//fmt.Println("now executing command", command)
	cmd := exec.Command("bash", "-c", command)

	out, err := cmd.Output()
	if err != nil {
		// log.Fatal(err)
		panic(err)
	}

	return out

	//https://zetcode.com/golang/exec-command/
}

func read_message(msg []byte) {

	fmt.Println("reading message...")

	// right now execute_command is the only
	// function that can panic, so we know that's
	// where the error was caused - change this later
	// if more panics were added
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Panic while executing command:", r)
		}
	}()

	fb_msg := message.GetRootAsMessage(msg, 0)
	//var arr = make([]byte, test.DataLength())

	switch msgType := fb_msg.Type(); msgType {
	case 1:
		read_task(fb_msg)
	case 2:
		read_result(fb_msg)
	case 3:
		read_hardwarepool(fb_msg)
	case 4:
		read_file(fb_msg)
	}

	//fmt.Println(fb_msg.Type())
}

func read_task(msg *message.Message) {

	fmt.Println("reading task...")

	unionTable := new(flatbuffers.Table)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyTask {
			unionTask := new(message.Task)
			unionTask.Init(unionTable.Bytes, unionTable.Pos)

			//temp_stages := make([]*message.Stage, unionTask.StagesLength())
			tempStage := new(message.Stage)
			stages := make([]stage, 0)

			// get all artifacts from task
			var artifacts_list = make([]string, unionTask.ArtifactsLength())
			for i := 0; i < unionTask.ArtifactsLength(); i++ {
				artifacts_list[i] = string(unionTask.Artifacts(i))
			}

			// get all stages from the task
			for i := 0; i < unionTask.StagesLength(); i++ {
				fmt.Println("STAGE", i)

				if unionTask.Stages(tempStage, i) {

					/*
						// execute the stage's commands=========
						var results = make([][]byte, tempStage.CmdListLength())
						for i := 0; i < tempStage.CmdListLength(); i++ {
							//fmt.Println(string(tempStage.CmdList(i)))
							result := execute_command(tempStage.CmdList(i))
							results[i] = result
						}

						// print the results from cmd exec

						for i, s := range results {
							fmt.Println(i, string(s))
						}
						//======================================
					*/

					// get all cmds from stage
					var cmd_list = make([]string, tempStage.CmdListLength())
					for i := 0; i < tempStage.CmdListLength(); i++ {
						cmd_list[i] = string(tempStage.CmdList(i))
					}

					tempData := new(message.Data)

					// get all file data from stage
					var data_list = make([]file_data, tempStage.DataLength())
					for i := 0; i < tempStage.DataLength(); i++ {

						if tempStage.Data(tempData, i) {
							fmt.Println("filename:")
							fmt.Println(string(tempData.Filename()))

							data_list[i] = file_data{path: string(tempData.Path()), filename: string(tempData.Filename()), downloaded: false}
						}

					}

					// save current stage for later :)
					temp_stage := stage{name: string(tempStage.Name()), data: data_list,
						cmd_list: cmd_list, track_time: tempStage.TrackTime(),
						track_ram: tempStage.TrackRam(), track_cpu: tempStage.TrackCpu(),
						track_gpu: tempStage.TrackGpu(), comment: string(tempStage.Comment())}

					stages = append(stages, temp_stage)

				}
			}

			fmt.Println("loaded stage into current stage")
			fmt.Println("current stage name:")
			fmt.Println(string(current_stage.name))

			task := task{stages: stages, artifacts: artifacts_list}
			current_task = task
			current_stage = stages[0]

			/*
				// set current task to first stage of task
				if len(temp_stages) > 0 {
					s := temp_stages[0]

					// get all cmds from stage
					var cmd_list = make([]string, s.CmdListLength())
					for i := 0; i < s.CmdListLength(); i++ {
						cmd_list[i] = string(s.CmdList(i))
					}

					tempData := new(message.Data)

					// get all file data from stage
					var data_list = make([]file_data, s.DataLength())
					for i := 0; i < s.DataLength(); i++ {

						if s.Data(tempData, i) {
							fmt.Println("filename:")
							fmt.Println(string(tempData.Filename()))

							data_list[i] = file_data{path: string(tempData.Path()), filename: string(tempData.Filename()), downloaded: false}
						}

					}

					// save current stage for later :)
					current_stage := stage{name: string(s.Name()), data: data_list,
						cmd_list: cmd_list, track_time: s.TrackTime(),
						track_ram: s.TrackRam(), track_cpu: s.TrackCpu(),
						track_gpu: s.TrackGpu(), comment: string(s.Comment())}

					fmt.Println("loaded stage into current stage")
					fmt.Println("current stage name:")
					fmt.Println(string(current_stage.name))
				}*/

		}
	}

	/*
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
	*/

	debug_print_current_task()

}

func debug_print_current_task() {
	fmt.Println("DEBUG PRINT CURRENT TASK")
	fmt.Println(current_task)

	fmt.Println("Artifacts:")
	fmt.Println(current_task.artifacts)

	for i := 0; i < len(current_task.stages); i++ {
		fmt.Println("Stage", i)
		stage := current_task.stages[i]
		fmt.Println(stage.name)
		fmt.Println(stage.cmd_list)
		fmt.Println(stage.data)
	}
}

// this function might be useless, don't think daemon is going to
// receive a message like this... :(
func read_hardwarepool(msg *message.Message) {

	fmt.Println("reading hardware...")

	unionTable := new(flatbuffers.Table)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyGetHardwarePool {
			unionHardware := new(message.GetHardwarePool)
			unionHardware.Init(unionTable.Bytes, unionTable.Pos)

			// TO-DO: what are we going to do with the unionHardware?
			// do something here
		}
	}

	/*
		msgHardware := msg.GetHardwarePool(new(message.GetHardwarePool))

		// TO-DO: use hardware info idk XD
		//fmt.Println(string(msgHardware.Hardware()))
		// print everyting in the hardware
		for i := 0; i < msgHardware.HardwareLength(); i++ {
			fmt.Println(string(msgHardware.Hardware(i)))
		}*/
}

func read_result(msg *message.Message) {

	fmt.Println("reading result...")

	unionTable := new(flatbuffers.Table)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyGetResult {
			unionResult := new(message.GetResult)
			unionResult.Init(unionTable.Bytes, unionTable.Pos)

			// TO-DO: what are we going to do with the unionResult?
			// do something here
		}
	}

	/*
		msgResult := msg.GetResult(new(message.GetResult))

		// print everyting in the result
		for i := 0; i < msgResult.IdListLength(); i++ {
			fmt.Println(string(msgResult.IdList(i)))
		}*/
}

func read_file(msg *message.Message) {

	fmt.Println("reading file...")

	unionTable := new(flatbuffers.Table)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyFile {
			unionFile := new(message.File)
			unionFile.Init(unionTable.Bytes, unionTable.Pos)

			saveFile(unionFile)
		}
	}

	//msgFile := msg.Body(new(message.File))
	//msgFile := msg.File(new(message.File))

}

// returns an open file or opens new file instead
func getOutputFile(filename string) *os.File {
	output_file, opened := open_files[filename]

	if !opened {
		//fmt.Println("opening new file...")
		output_file, err := os.OpenFile(string(filename), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

		if err != nil {
			log.Fatal(err)
		} else {
			//fmt.Println("saving to map...")
			// save the opened file to the map
			open_files[filename] = output_file
			return output_file
		}
	}

	return output_file
}

func saveFile(msgFile *message.File) {
	filename := msgFile.Filename()
	packetnr := msgFile.Packetnumber()
	eof := msgFile.Eof()

	fmt.Println(string(filename), packetnr, eof)

	// save file to disk
	arr := msgFile.DataBytes()

	// save arr to output file
	output_file := getOutputFile(string(filename))
	if output_file == nil {
		fmt.Println("big trouble idk")
	}
	//output_file.Write(arr)

	if eof {
		output_file.Close()

		// remove the file from the opened files map
		delete(open_files, string(filename))

		// check if all files downloaded for stage
		if check_and_set_downloaded(string(filename)) {
			// EXECUTE ALL COMMANDS HERE >:)
			fmt.Println("ALL FILES ARE NOW DOWNLOADED YAY :D")

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

// WIP
func run_daemon() {
	// to make a background thread?
	//ctx := context.Background()

}
