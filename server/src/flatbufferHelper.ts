import { schema } from "./testSchema_generated"
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
        return schema.Message.getRootAsMessage(buffer).bodyType()
    }
    
}

class Message
{
    type:number
    task:Task

    constructor(buf:flatbuffers.ByteBuffer)
    {
        let fbMessage = schema.Message.getRootAsMessage(buf)   
        let bla = fbMessage.body(new schema.Task() as flatbuffers.Table)
        let b = bla as schema.Task
        
        this.type = fbMessage.type()
        
        //let fbMessage = schema.Message.getRootAsMessage(buf)   
        //let bla = fbMessage.body(new schema.Task())
        //this.task = new Task(fbMessage.task()!)

        this.task = new Task(b)
    }
}

class Task
{
    public stages:Stage[]
    public artifacts:Artifact

    constructor(fbTask:schema.Task)
    {
        if (fbTask != null)
        {
            for (let i = 0; i < fbTask.stagesLength(); i++) 
            {
                this.stages.push(new Stage(fbTask.stages(i)!))
            }
            this.artifacts = new Artifact(fbTask)
        }
        
    }
}


class Stage
{
    public name:string | null | undefined
    public data:any
    public cmd:string[] | undefined
    public track_time:boolean| undefined
    public track_ram:boolean| undefined
    public track_cpu:boolean| undefined
    public track_gpu:boolean| undefined
    public comment:string | null | undefined

    constructor(fbStage:schema.Stage)
    {
        let stageCommands:string[] = []
        for (let i = 0; i < fbStage!.cmdListLength(); i++) 
        {
            stageCommands.push(fbStage!.cmdList(i))
        }

        this.name = fbStage?.name(), 
        this.data = fbStage?.dataArray(), 
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
        for (let i = 0; i < fbTask!.artifactsLength(); i++) 
        {
            this.files.push(fbTask!.artifacts(i))
        }
    }
}