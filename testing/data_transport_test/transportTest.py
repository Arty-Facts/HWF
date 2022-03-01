from venv import create
import flatbuffers
import HWFMessage
import requests
from websocket import create_connection

binFile = "dataToSend.bin"
ImgFile = "smallImg.png"
targetAgentId = 1
headers = {
        "Content-Type": "application/octet-stream",
    }

#Creates a bin file containing a target agent id and a string.
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


if __name__ == "__main__":
    # CreateBinary(binFile)
    # SendBinary(binFile)
    SendBinaryFromSourceFile(ImgFile)
