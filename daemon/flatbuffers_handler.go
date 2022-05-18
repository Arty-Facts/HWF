package main

import (
	//"context"
	"fmt"
	"os"
	"strconv"

	flatbuffers "github.com/google/flatbuffers/go"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"

	"github.com/jaypipes/ghw"

	message "test.com/test"
)

func Read_file(msg *message.Message) *message.File {
	unionTable := new(flatbuffers.Table)
	unionFile := new(message.File)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyFile {
			unionFile.Init(unionTable.Bytes, unionTable.Pos)
		}
	}

	return unionFile
}

func Read_task(msg *message.Message) task {
	unionTable := new(flatbuffers.Table)

	if msg.Body(unionTable) {

		unionType := msg.BodyType()

		if unionType == message.MessageBodyTask {
			unionTask := new(message.Task)
			unionTask.Init(unionTable.Bytes, unionTable.Pos)

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

					var cmd_list = make([]cmd, tempStage.CmdListLength())
					var data_list = make([]file_data, tempStage.DataLength())

					// get all cmds from stage
					for i := 0; i < tempStage.CmdListLength(); i++ {
						cmd_list[i] = cmd{command: string(tempStage.CmdList(i)), executed: false, std_err: nil, output: nil}
					}

					tempData := new(message.Data)

					// get all file data from stage
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

			return task{stages: stages, artifacts: artifacts_list, total_time: 0}
		}
	}

	return task{}
}

func Build_hardware() []byte {
	v, _ := mem.VirtualMemory()
	c, _ := cpu.Info()
	h, _ := host.Info()

	var gpu_info string
	g, err := ghw.GPU()
	if err != nil {
		fmt.Println("Could not find GPU info: %v", err)
		gpu_info = "N/A"
	} else {
		gpu_info = g.GraphicsCards[0].DeviceInfo.Vendor.Name + " " + g.GraphicsCards[0].DeviceInfo.Product.Name
	}

	builder := flatbuffers.NewBuilder(0)

	os := builder.CreateString(h.OS)
	cpu := builder.CreateString(c[0].ModelName)
	gpu := builder.CreateString(gpu_info)
	ram := builder.CreateString(strconv.FormatUint(v.Total, 10))

	message.HardwareStart(builder)
	message.HardwareAddOs(builder, os)
	message.HardwareAddCpu(builder, cpu)
	message.HardwareAddGpu(builder, gpu)
	message.HardwareAddRam(builder, ram)

	binHardware := message.HardwareEnd(builder)

	message.MessageStart(builder)
	message.MessageAddBody(builder, binHardware)
	message.MessageAddType(builder, 6)

	binMessage := message.MessageEnd(builder)

	builder.Finish(binMessage)

	return builder.FinishedBytes()
}

func Build_results(current_task *task) []byte {
	var curr_cmd *cmd

	var command_results []flatbuffers.UOffsetT
	var stage_results []flatbuffers.UOffsetT
	var artifacts_arr []flatbuffers.UOffsetT

	builder := flatbuffers.NewBuilder(0)

	// BUILD ALL COMMANDRESULTS
	// to-do: move this to build_command_results
	for i := 0; i < len(current_task.stages); i++ {
		for j := 0; j < len(current_task.stages[i].cmd_list); j++ {

			curr_cmd = &current_task.stages[i].cmd_list[j]
			cmd_result := Build_command_result(builder, curr_cmd)

			command_results = append(command_results, cmd_result)
		}
	}

	// BUILD ALL STAGERESULTS
	for i := 0; i < len(current_task.stages); i++ {
		stage_name := builder.CreateString(current_task.stages[i].name)
		// create cmd vector
		message.StageResultStartCmdVector(builder, len(current_task.stages[i].cmd_list))
		for _, command_result := range command_results {

			builder.PrependUOffsetT(command_result)
		}
		cmd_vector := builder.EndVector(len(current_task.stages[i].cmd_list))

		message.StageResultStart(builder)
		message.StageResultAddCmd(builder, cmd_vector)
		message.StageResultAddName(builder, stage_name)
		stage_result := message.StageResultEnd(builder)

		stage_results = append(stage_results, stage_result)
	}

	// BUILD ALL ARTIFACTS
	for k := 0; k < len(current_task.artifacts); k++ {
		file_name := builder.CreateString(current_task.artifacts[k])

		// create file data byte vector
		bytes, err := os.ReadFile(current_task.artifacts[k])
		if err != nil {
			// catch error here
		}
		arr := builder.CreateByteVector(bytes)

		message.ArtifactStart(builder)
		message.ArtifactAddFileName(builder, file_name)
		message.ArtifactAddData(builder, arr)
		artifact := message.ArtifactEnd(builder)

		artifacts_arr = append(artifacts_arr, artifact)
	}

	// create stages vector
	message.ResultStartStagesVector(builder, len(current_task.stages))
	for _, stage_result := range stage_results {
		builder.PrependUOffsetT(stage_result)
	}
	stages := builder.EndVector(len(current_task.stages))

	// create artifacts vector
	message.ResultStartArtifactsVector(builder, len(current_task.artifacts))
	fmt.Println("before artifacts loop")
	for _, artifact := range artifacts_arr {
		builder.PrependUOffsetT(artifact)
	}
	artifacts := builder.EndVector(len(current_task.artifacts))

	message.ResultStart(builder)
	// to-do: add total time for task
	message.ResultAddTime(builder, int32(current_task.total_time))
	message.ResultAddStages(builder, stages)
	message.ResultAddArtifacts(builder, artifacts)
	binResult := message.ResultEnd(builder)

	message.MessageStart(builder)
	message.MessageAddBody(builder, binResult)
	message.MessageAddType(builder, 5)
	binMessage := message.MessageEnd(builder)

	builder.Finish(binMessage)

	return builder.FinishedBytes()
}

func Build_command_result(builder *flatbuffers.Builder, curr_cmd *cmd) flatbuffers.UOffsetT {
	cmd := builder.CreateString(curr_cmd.command)
	out := builder.CreateByteVector(curr_cmd.output)
	err := builder.CreateByteVector(curr_cmd.std_err)
	cpu := builder.CreateString("default")
	gpu := builder.CreateString("default")
	ram := builder.CreateString("default")

	message.CommandResultStart(builder)
	message.CommandResultAddCmd(builder, cmd)
	message.CommandResultAddExit(builder, int32(curr_cmd.status_code))
	message.CommandResultAddStdout(builder, out)
	message.CommandResultAddStderr(builder, err)
	message.CommandResultAddCpu(builder, cpu)
	message.CommandResultAddGpu(builder, gpu)
	message.CommandResultAddRam(builder, ram)
	message.CommandResultAddTime(builder, int32(curr_cmd.execution_time))
	return message.CommandResultEnd(builder)
}
