"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const message_1 = require("./message");
const flatbuffers = __importStar(require("flatbuffers"));
const fs = __importStar(require("fs"));
const client = new ws_1.default('ws://localhost:9000?os=windows10&gpu=5700xt&cpu=r5_3600&ram=16gb');
client.on("open", () => {
    client.send("I'm an agent sending a message");
});
client.on("message", (data) => {
    console.log("Recieved:");
    console.log(data.length);
    console.log(data.length);
    if (data.length < 2500) {
        return;
    }
    let buf = new flatbuffers.ByteBuffer(data);
    let msg = message_1.Message.getRootAsMessage(buf);
    let dataArray = msg.dataArray();
    // let output = new Uint8Array(msg.dataLength())
    // for (let index = 0; index < msg.dataLength(); index++) {
    //     output[index] == msg.data
    // }
    fs.writeFileSync("finalData.png", Buffer.from(dataArray), "binary");
});
