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

client.on("message", (data:Uint8Array) => {
    console.log("Recieved:")
    console.log(data.length)
    console.log(data.length)
    if (data.length < 2500) {return}
    let buf = new flatbuffers.ByteBuffer(data)
    let msg = Message.getRootAsMessage(buf)
    let dataArray = msg.dataArray() 
    
    // let output = new Uint8Array(msg.dataLength())
    // for (let index = 0; index < msg.dataLength(); index++) {
        
    //     output[index] == msg.data
    // }

    fs.writeFileSync("finalData.png", Buffer.from(dataArray as ArrayBuffer), "binary")
})