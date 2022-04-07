import flatbuffers
import sys
from websocket import create_connection

sys.path.append("../../.") #Append project root directory so importing from schema works

import schema.GetHardwarePool as GetHardwarePool
import schema.GetJobs as GetJobs
import schema.Message as Message
import schema.Task as Task
import schema.Stage as Stage

binFile = "dataToSend.bin"
ImgFile = "hellgo.png"
targetAgentId = 1
headers = {
        "Content-Type": "application/octet-stream",
    }

# Creates a HWFMessage with param info, returns builder output

def createAndSendBuffer():

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

    ws = create_connection("ws://localhost:3001")
    ws.send_binary(buf)

    return 0
    
# def build_binary_message(_agentId, _cmd, _srcFile):
#     fbb = flatbuffers.Builder(1024)

#     # create cmd string
#     cmd = fbb.CreateString(_cmd)

#     # create srcfile byte arr
#     with open(_srcFile, "rb") as bin:
#         readBytes = bin.read()

#     byteVector = fbb.CreateByteVector(readBytes)
    

#     HWFMessage.MessageStart(fbb)

#     # agent id is temporary since server doesn't assign tasks yet
#     HWFMessage.MessageAddAgentId(fbb, _agentId)
#     HWFMessage.MessageAddCmd(fbb, cmd)
#     HWFMessage.MessageAddData(fbb, byteVector)

#     readyMsg = HWFMessage.MessageEnd(fbb)
#     fbb.Finish(readyMsg)
#     return fbb.Output()

"""""
# Creates a bin file containing a target agent id and a string.
def CreateBinary(destFile):

    fbb = flatbuffers.Builder(1024)
    cmd = fbb.CreateString("find / -name secretpasswordsdontlook.txt")
    
    HWFMessage.Start(fbb)
    HWFMessage.AddAgentId(fbb, targetAgentId)
    HWFMessage.AddCmd(fbb, cmd)
    readyMsg = HWFMessage.End(fbb)
    fbb.Finish(readyMsg)
    buf = fbb.Output()

    with open(destFile, "wb") as bin:
        bin.write(buf)

#Reads a file, saves its bytes in the vector "Data", then sends them to the hub together with an agent id 
def SendBinaryFromSourceFile(srcFile):

    with open(srcFile, "rb") as bin:
        readBytes = bin.read()

    fbb = flatbuffers.Builder(1024)

    byteVector = fbb.CreateByteVector(readBytes)

    HWFMessage.Start(fbb)
    HWFMessage.AddAgentId(fbb, targetAgentId)
    HWFMessage.AddData(fbb, byteVector)
    readyMsg = HWFMessage.End(fbb)

    fbb.Finish(readyMsg)
    buf = fbb.Output()

    ws = create_connection("ws://localhost:3001")
    ws.send_binary(buf)

#Sends a binary file to the hub
def SendBinary(srcFile):
    
    with open(srcFile, "rb") as bin:
        buf = bin.read()

    ws = create_connection("ws://localhost:3001")
    ws.send_binary(buf)
"""

# def send_request(cmd, filename):
#     temp_agent_id = 1
#     buf = createBuffer()
#     #buf = build_binary_message(temp_agent_id, cmd, filename)

#     # create bin file from message
#     global binFile
#     with open(binFile, "wb") as bin:
#         bin.write(buf)

#     ws = create_connection("ws://localhost:3001")
#     ws.send_binary(buf)  


if __name__ == "__main__":

    createAndSendBuffer()
    # CreateBinary(binFile)
    # SendBinary(binFile)
    # SendBinaryFromSourceFile(ImgFile)

    # what cmd command to run?

    # what file to send?
    
    #send_request("echo hello world", "hellgo.png")
