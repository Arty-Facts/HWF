import flatbuffers

import schema.GetHardwarePool as GetHardwarePool
import schema.GetJobs as GetJobs
import schema.Message as Message
import schema.Task as Task
import schema.Stage as Stage



def createBuffer():

    stage_amount = 2
    cmd_amount = 1

    cmdo = "I'm the first stage"
    
    builder = flatbuffers.Builder(1024)

    cmd = builder.CreateString(cmdo)
    
    Stage.StartCmdListVector(builder, cmd_amount)
    builder.PrependUOffsetTRelative(cmd)
    cmdVector = builder.EndVector()
    Stage.Start(builder)
    Stage.AddCmdList(builder, cmdVector)
    stage = Stage.End(builder)


    cmdo = "I'm the second stage"

    cmd = builder.CreateString(cmdo)

    Stage.StartCmdListVector(builder, cmd_amount)
    builder.PrependUOffsetTRelative(cmd)
    cmdVector = builder.EndVector()
    Stage.Start(builder)
    Stage.AddCmdList(builder, cmdVector)
    stage2 = Stage.End(builder)


   
    Task.StartStagesVector(builder, stage_amount)
    builder.PrependUOffsetTRelative(stage2)
    builder.PrependUOffsetTRelative(stage)
    stages = builder.EndVector()

    Task.Start(builder)
    Task.AddStages(builder, stages)
    task = Task.End(builder)


    Message.Start(builder)
    Message.AddType(builder, 1)
    Message.AddTask(builder, task)
    message = Message.End(builder)

    builder.Finish(message)
    buf = builder.Output()

    return buf

def readBuffer(buf):
    
    message = Message.Message.GetRootAs(buf, 0)
    

    if (message.Type() == 1):
        print(f"This message is of the type Task")

        task = message.Task()

        for index in range(task.StagesLength()):
            print(task.Stages(index).CmdList(0))

    elif (message.Type() == 2):
        print("This message is of the type GetResults")

    elif (message.Type() == 3):
        print("This message is of the type GetHardwarePool")
        
    else:
        print("Message type does not match anything")
    #print(f"This buffer has &{message.StagesLength()} stages")
    #read type from Messsage
    #read stages from task
    #print cmd from each stage






def readBufferWithWeirdMethod(buf):
    tPos = flatbuffers.GetUOffsetT(buf)
    offset = flatbuffers.UOffsetT(flatbuffers.SOffsetT(tPos) - flatbuffers.GetSOffsetT(buf[tPos:]))
    offset = flatbuffers.UOffsetT(4) + offset
    o = flatbuffers.UOffsetT(flatbuffers.GetVOffsetT(buf[offset:]))
    pos = tPos + o
    id = flatbuffers.GetInt16(buf[pos:])

    print("ID is ", id)

    pass
if __name__ == "__main__":
    buffer = createBuffer()
    readBuffer(buffer)