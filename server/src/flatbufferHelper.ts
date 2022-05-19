import { schema } from "./hwfSchema_generated"
import * as flatbuffers from "flatbuffers"
import "./db/mongo_db"

export class FlatbufferHelper 
{
    readFlatbufferBinary(data:Uint8Array)
    {
        return new Message(new flatbuffers.ByteBuffer(data))
    }
    
    getFlatbufferType(data:Uint8Array)
    {
        let buffer = new flatbuffers.ByteBuffer(data)
        return schema.Message.getRootAsMessage(buffer).type()
        //return schema.Message.getRootAsMessage(buffer).bodyType()
    }
    
    buildFlatbufferResultList(stringList:string[]) 
    {

        let resultList:number[] = []
        let builder = new flatbuffers.Builder(0);
        console.log("====================STRING LIST TIME )=========================0a")
        console.log(stringList)
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!NO MORE LISTAITIAEJAP!!!!!!!!!!!!!!!!!!")

        stringList.forEach(resultString => {
            
        
        // for (let resultString in stringList){
            console.log("TYPE TIEM")
            console.log(typeof resultString)
            console.log(resultString)
            let resultStringIFY = JSON.stringify(resultString)
            let result = JSON.parse(resultStringIFY)
            console.log(result)
            console.log("========================================LIST HERE===============================================")
            //console.log(result)

            let stage_results = []
            let command_results = []
            let artifacts = []
            let hardwares = []


            for ( let stageResult of result.stageResults)
            {
                for ( let commandResult of stageResult.cmd)
                {
                    let stdout = null
                    let stderr = null

                    let cmd = builder.createString(commandResult.cmd)
                    let os = builder.createString(commandResult.os)
                    let cpu = builder.createString(commandResult.cpu)
                    let gpu = builder.createString(commandResult.gpu)
                    let ram = builder.createString(commandResult.ram)
                    console.log("Kolla stderrARRAY!!")
                    console.log(typeof(commandResult.stderr))
                    console.log(commandResult.stderr)
                    console.log("Kolla stdoutARRAY!!")
                    console.log(typeof(commandResult.stdout))
                    console.log(commandResult.stdout)
                    //console.log(Object.values(commandResult.stdout))
                    if (commandResult.stdout === null || commandResult.stdout === undefined || commandResult.stdout == null || commandResult.stdout == undefined)
                    {
                        stdout = schema.CommandResult.createStdoutVector(builder, [])
                        console.log("hello hi we are here")
                    }
                    else 
                    {
                        console.log("stout else, ie not null")
                        console.log(commandResult.stdout)
                        stdout = schema.CommandResult.createStdoutVector(builder, Object.values(commandResult.stdout))
                    }
                    
                    if (commandResult.stderr === null || commandResult.stderr === undefined || commandResult.stderr == null || commandResult.stderr == undefined)
                    {
                        stderr = schema.CommandResult.createStderrVector(builder, [])
                    }
                    else 
                    {
                        console.log("sterr else, ie not null")
                        console.log(commandResult.stderr)
                        stderr = schema.CommandResult.createStderrVector(builder, Object.values(commandResult.stderr))
                    }
                    

                    
                    schema.CommandResult.startCommandResult(builder)
                    schema.CommandResult.addCmd(builder, cmd)
                    schema.CommandResult.addExit(builder,commandResult.exit)
                    schema.CommandResult.addStdout(builder, stdout)
                    schema.CommandResult.addStderr(builder, stderr)
                    schema.CommandResult.addOs(builder, os)
                    schema.CommandResult.addCpu(builder, cpu)
                    schema.CommandResult.addGpu(builder, gpu)
                    schema.CommandResult.addRam(builder, ram)
                    schema.CommandResult.addTime(builder, commandResult.time)
                    command_results.push(schema.CommandResult.endCommandResult(builder))
                }
                let name = builder.createString(stageResult.name)
                let cmdvec = schema.StageResult.createCmdVector(builder, command_results)
                schema.StageResult.startStageResult(builder)
                schema.StageResult.addCmd(builder, cmdvec)
                schema.StageResult.addName(builder, name)
                stage_results.push(schema.StageResult.endStageResult(builder))
                command_results = []
            }

            for (let artifact of result.artifacts)
            {
                let file_name = builder.createString(artifact.fileName)
                let data = schema.Artifact.createDataVector(builder, Object.values(artifact.data))

                schema.Artifact.startArtifact(builder)
                schema.Artifact.addFileName(builder, file_name)
                schema.Artifact.addData(builder, data)
                artifacts.push(schema.Artifact.endArtifact(builder))
            }

            for (let hardware of result.hardware)
            {
                let cpu = builder.createString(hardware.cpu)
                let gpu = builder.createString(hardware.gpu)
                let os = builder.createString(hardware.os)
                let ram = builder.createString(hardware.ram)

                schema.Hardware.startHardware(builder)
                schema.Hardware.addCpu(builder, cpu)
                schema.Hardware.addGpu(builder, gpu)
                schema.Hardware.addOs(builder, os)
                schema.Hardware.addRam(builder, ram)
                hardwares.push(schema.Hardware.endHardware(builder))
            }


            //create result
            let stagevec = schema.Result.createStagesVector(builder, stage_results)
            let artifactvec = schema.Result.createArtifactsVector(builder, artifacts)
            let hwvec = schema.Result.createHardwareVector(builder, hardwares)
            
            schema.Result.startResult(builder)
            schema.Result.addTime(builder, result.time)
            schema.Result.addStages(builder, stagevec)
            schema.Result.addArtifacts(builder, artifactvec)
            schema.Result.addHardware(builder, hwvec)
            let res = schema.Result.endResult(builder)

            resultList.push(res)

            //builder.finish(res)
            
            //return builder.asUint8Array()
        });

        // let fixedBuffers:schema.Result[] = []
        // bufferList.forEach(buf => {
        //     fixedBuffers.push(schema.Result.getRootAsResult(new flatbuffers.ByteBuffer(buf)))
        // });
            
        let a = schema.ResultList.createTasksVector(builder, resultList)

        schema.ResultList.startResultList(builder)
        schema.ResultList.addTasks(builder, a)
        let doneResultList = schema.ResultList.endResultList(builder)

        schema.Message.startMessage(builder)
        //schema.Message.addType(builder, 6) not used
        schema.Message.addBodyType(builder, schema.MessageBody.ResultList)
        schema.Message.addBody(builder, doneResultList)
        let pleasebedone = schema.Message.endMessage(builder)
        

        builder.finish(pleasebedone)

        let buf = builder.asUint8Array()

        return buf
            

    }
    buildFlatbufferResult(resultString:string)
    {
        let builder = new flatbuffers.Builder(0);
        let result = JSON.parse(resultString)
        console.log(result.st)
        let stage_results = []
        let command_results = []
        let artifacts = []
        let hardwares = []


        for ( let stageResult of result.stageResults)
        {
            for ( let commandResult of stageResult.cmd)
            {
                let stdout = null
                let stderr = null

                let cmd = builder.createString(commandResult.cmd)
                let os = builder.createString(commandResult.os)
                let cpu = builder.createString(commandResult.cpu)
                let gpu = builder.createString(commandResult.gpu)
                let ram = builder.createString(commandResult.ram)
                console.log("Kolla stderrARRAY!!")
                console.log(typeof(commandResult.stderr))
                console.log(commandResult.stderr)
                console.log("Kolla stdoutARRAY!!")
                console.log(typeof(commandResult.stdout))
                console.log(commandResult.stdout)
                //console.log(Object.values(commandResult.stdout))
                if (commandResult.stdout === null || commandResult.stdout === undefined || commandResult.stdout == null || commandResult.stdout == undefined)
                {
                    stdout = schema.CommandResult.createStdoutVector(builder, [])
                    console.log("hello hi we are here")
                }
                else 
                {
                    console.log("stout else, ie not null")
                    console.log(commandResult.stdout)
                    stdout = schema.CommandResult.createStdoutVector(builder, Object.values(commandResult.stdout))
                }
                
                if (commandResult.stderr === null || commandResult.stderr === undefined || commandResult.stderr == null || commandResult.stderr == undefined)
                {
                    stderr = schema.CommandResult.createStderrVector(builder, [])
                }
                else 
                {
                    console.log("sterr else, ie not null")
                    console.log(commandResult.stderr)
                    stderr = schema.CommandResult.createStderrVector(builder, Object.values(commandResult.stderr))
                }
                

                
                schema.CommandResult.startCommandResult(builder)
                schema.CommandResult.addCmd(builder, cmd)
                schema.CommandResult.addExit(builder,commandResult.exit)
                schema.CommandResult.addStdout(builder, stdout)
                schema.CommandResult.addStderr(builder, stderr)
                schema.CommandResult.addOs(builder, os)
                schema.CommandResult.addCpu(builder, cpu)
                schema.CommandResult.addGpu(builder, gpu)
                schema.CommandResult.addRam(builder, ram)
                schema.CommandResult.addTime(builder, commandResult.time)
                command_results.push(schema.CommandResult.endCommandResult(builder))
            }
            let name = builder.createString(stageResult.name)
            let cmdvec = schema.StageResult.createCmdVector(builder, command_results)
            schema.StageResult.startStageResult(builder)
            schema.StageResult.addCmd(builder, cmdvec)
            schema.StageResult.addName(builder, name)
            stage_results.push(schema.StageResult.endStageResult(builder))
            command_results = []
        }

        for (let artifact of result.artifacts)
        {
            let file_name = builder.createString(artifact.file_name)
            let data = schema.Artifact.createDataVector(builder, Object.values(artifact.data))

            schema.Artifact.startArtifact(builder)
            schema.Artifact.addFileName(builder, file_name)
            schema.Artifact.addData(builder, data)
            artifacts.push(schema.Artifact.endArtifact(builder))
        }

        for (let hardware of result.hardware)
        {
            let cpu = builder.createString(hardware.cpu)
            let gpu = builder.createString(hardware.gpu)
            let os = builder.createString(hardware.os)
            let ram = builder.createString(hardware.ram)

            schema.Hardware.startHardware(builder)
            schema.Hardware.addCpu(builder, cpu)
            schema.Hardware.addGpu(builder, gpu)
            schema.Hardware.addOs(builder, os)
            schema.Hardware.addRam(builder, ram)
            hardwares.push(schema.Hardware.endHardware(builder))
        }


        //create result
        let stagevec = schema.Result.createStagesVector(builder, stage_results)
        let artifactvec = schema.Result.createArtifactsVector(builder, artifacts)
        let hwvec = schema.Result.createHardwareVector(builder, hardwares)
        
        schema.Result.startResult(builder)
        schema.Result.addTime(builder, result.time)
        schema.Result.addStages(builder, stagevec)
        schema.Result.addArtifacts(builder, artifactvec)
        schema.Result.addHardware(builder, hwvec)
        let res = schema.Result.endResult(builder)
        
        
        builder.finish(res)
        
        return builder.asUint8Array()
    }
}

/*
{
  _id: '627e2c3ac935bab966540669',
  stageResults: [
    { cmd: [Array], name: 'Bobby' },
    { cmd: [Array], name: 'Bobby' },
    { cmd: [Array], name: 'Bob' }
  ],
  artifacts: [ { fileName: 'log.txt', data: [Object] } ],
  hardware: []
}
{
  cmd: [
    {
      stdout: [Object],
      stderr: null,
      cmd: 'echo banana',
      exit: 0,
      os: null,
      cpu: 'default',
      gpu: 'default',
      ram: 'default',
      time: 0
    },
    {
      stdout: null,
      stderr: null,
      cmd: 'ls -la > fog.txt',
      exit: 0,
      os: null,
      cpu: 'default',
      gpu: 'default',
      ram: 'default',
      time: 0
    }
  ],
  name: 'Bobby'
}
*/


/*
    TASK = 1
    GET_RESULT = 2
    HARDWARE_POOL = 3
    GET_HARDWARE_POOL = 3
    FILE = 4
    RESULT = 5
*/

class Message
{
    public type:number
    //public task:Task
    public messageBody:Task|Result|GetResult|Hardware

    constructor(buf:flatbuffers.ByteBuffer)
    {
        let fbMessage = schema.Message.getRootAsMessage(buf)   
        console.log(fbMessage.type())
        switch(fbMessage.type()){
            case 1:{
                let temp = fbMessage.body(new schema.Task() as flatbuffers.Table)
                let task = temp as schema.Task
                this.messageBody = new Task(task)
                console.log("After Task created")
                break
            }
            case 2:{
                let temp = fbMessage.body(new schema.GetResult() as flatbuffers.Table)
                let getResult = temp as schema.GetResult
                this.messageBody = new GetResult(getResult)
                break
            }
            case 5:{
                let temp = fbMessage.body(new schema.Result() as flatbuffers.Table)
                let result = temp as schema.Result
                this.messageBody = new Result(result)
                break
            }
            case 6:{
                let temp = fbMessage.body(new schema.Hardware() as flatbuffers.Table)
                let hw = temp as schema.Hardware
                this.messageBody = new Hardware(hw)
                break
            }
        }

        
    }
}




export class Task
{
    public hardware:Hardware
    public stages:Stage[]
    //public artifacts:Artifact
    public artifacts:String[]

    constructor(fbTask:schema.Task)
    {
        this.stages = []
        this.artifacts = []
        if (fbTask != null)
        {
            for (let i = 0; i < fbTask.stagesLength(); i++) 
            {
                this.stages.push(new Stage(fbTask.stages(i)!))
            }
            //this.artifacts = new Artifact(fbTask)
            for (let i = 0; i < fbTask.artifactsLength(); i++) 
            {
                this.artifacts.push(fbTask.artifacts(i))
                //this.stages.push(new Stage(fbTask.stages(i)!))
            }
            
        }
        this.hardware = new Hardware(fbTask.hardware()!)
    }
}

export class GetResult
{
    public id_list:string[]

    constructor(fbGetResult:schema.GetResult)
    {
        this.id_list = []
        if (fbGetResult != null)
        {
            for (let i = 0; i < fbGetResult.idListLength(); i++) 
            {
                this.id_list.push(fbGetResult.idList(i)!)
            }
        }
    }
}

class Stage
{
    public name:string | null | undefined
    public data:Data[] | null | undefined
    public cmd:string[] | undefined
    public track_time:boolean| undefined
    public track_ram:boolean| undefined
    public track_cpu:boolean| undefined
    public track_gpu:boolean| undefined
    public comment:string | null | undefined

    constructor(fbStage:schema.Stage)
    {
        this.data = []
        let stageCommands:string[] = []
        for (let i = 0; i < fbStage!.cmdListLength(); i++) 
        {
            stageCommands.push(fbStage!.cmdList(i))
        }

        for (let i = 0; i < fbStage!.dataLength(); i++) 
        {
            this.data.push(new Data(fbStage!.data(i)!))
        }

        this.name = fbStage?.name(), 
        //this.data = fbStage?.dataArray(), 
        this.cmd = stageCommands, 
        this.track_time = fbStage?.trackTime(), 
        this.track_ram = fbStage?.trackRam(), 
        this.track_cpu = fbStage?.trackCpu(), 
        this.track_gpu = fbStage?.trackGpu(), 
        this.comment = fbStage?.comment()
    }
    
}

class Artifact
{
    public fileName:String
    public data:Uint8Array
    
    constructor(fbArtifact:schema.Artifact)
    {
        this.fileName = fbArtifact.fileName()!
        this.data = fbArtifact.dataArray()!
    }
}

export class Hardware
{
    public cpu:string | null | undefined
    public gpu:string | null | undefined
    public os:string | null | undefined
    public ram:string |null | undefined

    constructor(fbTask:schema.Hardware)
    {
        this.cpu = fbTask!.cpu()
        this.gpu = fbTask!.gpu()
        this.os = fbTask!.os()
        this.ram = fbTask!.ram()
    }
}

class Data
{
    public path:string | null | undefined
    public filename:string | null | undefined
    
    constructor(fbData:schema.Data)
    {
        this.path = fbData!.path()
        this.filename = fbData!.filename()
    }
}


class Result
{
    public time:number
    public stageResults:StageResult[]
    public artifacts:Artifact[]
    public hardware:Hardware[]

    constructor(fbResult:schema.Result)
    {
        this.stageResults = []
        this.artifacts = []
        this.hardware = []

        if (fbResult != null)
        {
            this.time = fbResult.time()
            for (let i = 0; i < fbResult.stagesLength(); i++)
            {
                this.stageResults.push(new StageResult(fbResult.stages(i)!))
            }
            for (let i = 0; i < fbResult.artifactsLength(); i++)
            {
                this.artifacts.push(new Artifact(fbResult.artifacts(i)!))
            }
            for (let i = 0; i < fbResult.hardwareLength(); i++)
            {
                this.hardware.push(new Hardware(fbResult.hardware(i)!))
            }

        }
    }
}

class StageResult
{
    public cmd:CommandResult[]
    public name:String

    constructor(fbStageResult:schema.StageResult)
    {
        this.cmd = []
        for (let i = 0; i < fbStageResult.cmdLength(); i++)
        {
            this.cmd.push(new CommandResult(fbStageResult.cmd(i)!))
        }
        this.name = fbStageResult.name()!
    }
}

class CommandResult
{
    public cmd:string
    public exit:Number
    public stdout:Uint8Array|undefined|null
    public stderr:Uint8Array|undefined|null
    public os:string
    public cpu:string
    public gpu:string
    public ram:string
    public time:number

    constructor(fbCommandResult:schema.CommandResult)
    {
        this.stdout = null
        this.stderr = null
        this.cmd = fbCommandResult.cmd()!
        this.exit = fbCommandResult.exit()!
        if (fbCommandResult.stdoutLength() != 0)
        {
            this.stdout = fbCommandResult.stdoutArray()
        }
        if (fbCommandResult.stderrLength() != 0)
        {
            this.stderr = fbCommandResult.stderrArray()
        }
        
        this.os = fbCommandResult.os()!
        this.cpu = fbCommandResult.cpu()!
        this.gpu = fbCommandResult.gpu()!
        this.ram = fbCommandResult.ram()!
        this.time = fbCommandResult.time()!
    }
}

