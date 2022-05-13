import { schema } from "./hwfSchema_generated"
import * as flatbuffers from "flatbuffers"

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
    

}

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
    public messageBody:Task|Result

    constructor(buf:flatbuffers.ByteBuffer)
    {
        let fbMessage = schema.Message.getRootAsMessage(buf)   
        switch(fbMessage.type()){
            case 1:{
                let temp = fbMessage.body(new schema.Task() as flatbuffers.Table)
                let task = temp as schema.Task
                this.messageBody = new Task(task)
            }
            case 5:{
                let temp = fbMessage.body(new schema.Result() as flatbuffers.Table)
                let result = temp as schema.Result
                this.messageBody = new Result(result)
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

class Hardware
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

