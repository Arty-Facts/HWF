"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Testklient för server.js
const ws_1 = __importDefault(require("ws"));
const client = new ws_1.default('ws://localhost:3000?os=windows10&gpu=5700xt&cpu=r5_3600&ram=16gb');
client.on("open", () => {
    client.send("Jag är en agent");
});
client.on("message", (message) => {
    console.log(`Recieved: ${message}`);
});
