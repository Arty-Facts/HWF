#apiapaidpaisid

from venv import create
import flatbuffers
import HWFMessage
import requests
from websocket import create_connection

binFile = "dataToSend.bin"
ImgFile = "hellgo.png"
targetAgentId = 1
headers = {
        "Content-Type": "application/octet-stream",
    }

# Creates a HWFMessage with param info, returns builder output
def build_binary_message(_agentId, _cmd, _srcFile):
    fbb = flatbuffers.Builder(1024)

    # create cmd string
    cmd = fbb.CreateString(_cmd)

    # create srcfile byte arr
    with open(_srcFile, "rb") as bin:
        readBytes = bin.read()

    byteVector = fbb.CreateByteVector(readBytes)
    

    HWFMessage.MessageStart(fbb)

    # agent id is temporary since server doesn't assign tasks yet
    HWFMessage.MessageAddAgentId(fbb, _agentId)
    HWFMessage.MessageAddCmd(fbb, cmd)
    HWFMessage.MessageAddData(fbb, byteVector)

    readyMsg = HWFMessage.MessageEnd(fbb)
    fbb.Finish(readyMsg)
    return fbb.Output()

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

def send_request(cmd, filename):
    temp_agent_id = 1
    buf = build_binary_message(temp_agent_id, cmd, filename)

    # create bin file from message
    global binFile
    with open(binFile, "wb") as bin:
        bin.write(buf)

    ws = create_connection("ws://localhost:3001")
    ws.send_binary(buf)  


if __name__ == "__main__":
    # CreateBinary(binFile)
    # SendBinary(binFile)
    # SendBinaryFromSourceFile(ImgFile)

    # what cmd command to run?

    # what file to send?
    send_request("echo hello world", "hellgo.png")
