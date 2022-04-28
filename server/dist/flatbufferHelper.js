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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatbufferHelper = void 0;
const hwfSchema_generated_1 = require("./hwfSchema_generated");
const flatbuffers = __importStar(require("flatbuffers"));
class FlatbufferHelper {
    readFlatbufferBinary(data) {
        return new Message(new flatbuffers.ByteBuffer(data));
    }
    getFlatbufferType(data) {
        let buffer = new flatbuffers.ByteBuffer(data);
        return hwfSchema_generated_1.schema.Message.getRootAsMessage(buffer).type();
        //return schema.Message.getRootAsMessage(buffer).bodyType()
    }
}
exports.FlatbufferHelper = FlatbufferHelper;
class Message {
    constructor(buf) {
        let fbMessage = hwfSchema_generated_1.schema.Message.getRootAsMessage(buf);
        let bla = fbMessage.body(new hwfSchema_generated_1.schema.Task());
        let b = bla;
        this.type = fbMessage.type();
        //console.log(b)
        //let fbMessage = schema.Message.getRootAsMessage(buf)   
        //let bla = fbMessage.body(new schema.Task())
        //this.task = new Task(fbMessage.task()!)
        this.task = new Task(b);
        //console.log(this.task)
    }
}
class Task {
    constructor(fbTask) {
        this.stages = [];
        if (fbTask != null) {
            for (let i = 0; i < fbTask.stagesLength(); i++) {
                this.stages.push(new Stage(fbTask.stages(i)));
            }
            this.artifacts = new Artifact(fbTask);
        }
        this.hardware = new Hardware(fbTask.hardware());
    }
}
class Stage {
    constructor(fbStage) {
        let stageCommands = [];
        for (let i = 0; i < fbStage.cmdListLength(); i++) {
            stageCommands.push(fbStage.cmdList(i));
        }
        this.name = fbStage === null || fbStage === void 0 ? void 0 : fbStage.name(),
            this.data = fbStage === null || fbStage === void 0 ? void 0 : fbStage.dataArray(),
            this.cmd = stageCommands,
            this.track_time = fbStage === null || fbStage === void 0 ? void 0 : fbStage.trackTime(),
            this.track_ram = fbStage === null || fbStage === void 0 ? void 0 : fbStage.trackRam(),
            this.track_cpu = fbStage === null || fbStage === void 0 ? void 0 : fbStage.trackCpu(),
            this.track_gpu = fbStage === null || fbStage === void 0 ? void 0 : fbStage.trackGpu(),
            this.comment = fbStage === null || fbStage === void 0 ? void 0 : fbStage.comment();
    }
}
class Artifact {
    constructor(fbTask) {
        this.files = [];
        for (let i = 0; i < fbTask.artifactsLength(); i++) {
            this.files.push(fbTask.artifacts(i));
        }
    }
}
class Hardware {
    constructor(fbTask) {
        this.cpu = fbTask.cpu();
        this.gpu = fbTask.gpu();
        this.os = fbTask.os();
    }
}
