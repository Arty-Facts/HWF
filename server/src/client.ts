//Testclient for server.js
import { ByteBuffer } from "flatbuffers"
import ws, { RawData } from "ws"
import { Message } from "./message"
import * as flatbuffers from "flatbuffers"
import * as fs from "fs"

const client = new ws('ws://localhost:3000?os=windows10&gpu=5700xt&cpu=r5_3600&ram=16gb')

client.on("open", () => {
    client.send("I'm an agent sending a message")
})

client.on("message", (data:RawData) => {
    console.log("Recieved:")
    console.log(data)
    
    // let buf = new Uint8Array(data.)
    // let buf = new flatbuffers.ByteBuffer(data)
    // let msg = Message.getRootAsMessage(buf)
    // let msgData = msg.dataLength()
    // let id = msg.agentId()
    // console.log("HEre is the message ID:")
    // console.log(id)
   //fs.writeFileSync("finalData.png", msg.dataLength(), "binary")
})