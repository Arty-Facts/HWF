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

class Message
{
    public type:number
    public task:Task

    constructor(buf:flatbuffers.ByteBuffer)
    {
        let fbMessage = schema.Message.getRootAsMessage(buf)   
        let bla = fbMessage.body(new schema.Task() as flatbuffers.Table)
        let b = bla as schema.Task
        
        this.type = fbMessage.type() 
        
        //console.log(b)
        //let fbMessage = schema.Message.getRootAsMessage(buf)   
        //let bla = fbMessage.body(new schema.Task())
        //this.task = new Task(fbMessage.task()!)

        this.task = new Task(b)
        //console.log(this.task)
    }
}

class Task
{
    public hardware:Hardware
    public stages:Stage[]
    public artifacts:Artifact

    constructor(fbTask:schema.Task)
    {
        this.stages = []
        if (fbTask != null)
        {
            for (let i = 0; i < fbTask.stagesLength(); i++) 
            {
                this.stages.push(new Stage(fbTask.stages(i)!))
            }
            this.artifacts = new Artifact(fbTask)
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
    public files:string[]
    
    constructor(fbTask:schema.Task)
    {
        this.files = [];
        for (let i = 0; i < fbTask!.artifactsLength(); i++) 
        {
            this.files.push(fbTask!.artifacts(i))
        }
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