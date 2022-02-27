import flatbuffers
import HWFMessage
import requests

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

    res = requests.post("http://localhost:3000/sendToAgent", data = buf, headers = headers)    

    print(res.text)

#Sends a binary file to the hub
def SendBinary(srcFile):
    
    with open(srcFile, "rb") as bin:
        buf = bin.read()

    res = requests.post("http://localhost:3000/sendToAgent", data = buf, headers = headers)    

if __name__ == "__main__":
    CreateBinary(binFile)
    SendBinary(binFile)
    #SendBinaryFromSourceFile(ImgFile)
