"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const client = new ws_1.default('ws://localhost:3000?os=windows10&gpu=5700xt&cpu=r5_3600&ram=16gb');
client.on("open", () => {
    client.send("I'm an agent sending a message");
});
client.on("message", (data) => {
    console.log("Recieved:");
    console.log(data);
    // let buf = new Uint8Array(data.)
    // let buf = new flatbuffers.ByteBuffer(data)
    // let msg = Message.getRootAsMessage(buf)
    // let msgData = msg.dataLength()
    // let id = msg.agentId()
    // console.log("HEre is the message ID:")
    // console.log(id)
    //fs.writeFileSync("finalData.png", msg.dataLength(), "binary")
});
