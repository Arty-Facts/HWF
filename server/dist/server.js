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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const ws = __importStar(require("ws"));
const express_1 = __importDefault(require("express"));
const mongo_db_1 = require("./db/mongo_db");
const cors_1 = __importDefault(require("cors"));
const flatbufferHelper_1 = require("./flatbufferHelper");
const fbHelper = new flatbufferHelper_1.FlatbufferHelper();
const app = (0, express_1.default)();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });
const userServer = http.createServer(app);
const userWss = new ws.Server({ server: userServer });
//connect to the database:
const db = new mongo_db_1.dbAdapter();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "*"]
}));
//TODOs & General thoughts: 
//Should agents be able to name themselved when connecting? The daemon could maybe pick the systems own name automatically when first connecting
//We should save info about connected agents even after they disconnect (currently nothing is saved for a disconnected client). That way their name, id & info could be "reserved" in case of a temporary diconnect
//According to what i've read ws doesn't propely close a socket if it's disconnected improperly (such as a network cable getting unplugged). We should test this (and solve it if necessary)
//Should something be logged to a file? That being things that aren't saved in the DB, such as connects/disconnects.
//Maybe add timestamps to log messages? ("[2022-03-13, 16:33:24] Error: bla bla bla")
var agents = [];
function main() {
    var loadBalancer = new LoadBalancer("fifo");
    loadBalancer.queue = new Queue();
    userServer.listen(3001, () => {
        console.log("Userserver listening on port: 3001");
    });
    server.listen(9000, () => {
        console.log("Listening on port: 9000");
    });
}
class Agent {
    constructor(ws) {
        this.socket = ws;
        this.isIdle = true;
    }
    send(data) {
        this.socket.send(data);
    }
}
class Queue {
    enqueue(data, index) {
        if (index) {
            this.contents.splice(index, 0, data);
        }
        else {
            this.contents.push(data);
        }
    }
    dequeue(target) {
        if (typeof target == "number") {
            this.contents.splice(target, 0);
        }
        else {
            this.contents.splice(this.contents.indexOf(target), 0);
        }
    }
    size() {
        return this.contents.length;
    }
}
class LoadBalancer {
    constructor(priority) {
        if (priority) {
            this.priorityType = priority;
        }
        else {
            priority = "fifo";
        }
    }
    queueTask(task) {
        this.queue.enqueue(task);
    }
    retryQueuedTasks() {
        if (this.priorityType == "fifo") {
            this.queue.contents.reverse().forEach(task => {
                let agent = findAgentForTask(task);
                if (agent != null && agent.isIdle) {
                    agent.send(task);
                    this.queue.dequeue(task);
                }
            });
        }
        else if (this.priorityType == "lifo") {
            this.queue.contents.forEach(task => {
                let agent = findAgentForTask(task);
                if (agent != null && agent.isIdle) {
                    agent.send(task);
                    this.queue.dequeue(task);
                }
            });
        }
    }
}
wss.on('connection', (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    let ip = req.socket.remoteAddress;
    let url = req.url;
    console.log(`\nNew Daemon connected from [${ip}].`);
    if (ip == undefined) {
        throw "Could not read ip of connecting agent, was undefined";
    }
    let agent = createAgent(ws, ip);
    // let queries:ParsedUrlQuery = url.parse(req.url!, true).query
    //agent.specs = {"os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"],}
    if (url != null) {
        agent.specs = {
            "os": url.match(/os=(\S+?)&/)[0],
            "gpu": url.match(/gpu=(\S+?)&/)[0],
            "cpu": url.match(/cpu=(\S+?)&/)[0],
            "ram": url.match(/ram=(\S+?)$/)[0]
        };
    }
    console.log("Agent specs:");
    console.log(agent.specs);
    ws.on("message", (message) => {
        console.log("\nws.onMessage from [Daemon]");
        console.log(`Recieved message: ["${message}"] from Daemon: [${agent.name}] `);
    });
    ws.on('close', () => {
        console.log(`Client "${agent.name}" disconnected`);
    });
}));
userWss.on("connection", (ws, req) => {
    console.log(`\nNew User-client connected from [${req.socket.remoteAddress}].`);
    ws.on("message", (message) => {
        let readableMessage = fbHelper.readFlatbufferBinary(message);
        let agent = findAgentForTask(readableMessage);
        if (agent == null) {
            sendToUser(ws, "No fitting agent could be found for this task"); //TODO: add way to force queuing of task even if no matching agent is connected?
        }
        else if (agent.isIdle) {
            agent.send(message);
        }
        else {
        }
    });
});
//TODO: expand this to include all agent fields, not just the ip
function saveAgentInDb(agent) {
    let id = db.addDaemon(agent.ip);
    console.log(`added new agent with id: ["${id}"]`);
    return id;
}
function createAgent(socket, ip) {
    let agent = new Agent(socket);
    agents.push(agent);
    agent.ip = ip;
    agent.id = db.addDaemon(agent.ip);
    return agent;
}
//TODO: implement this properly
function sendToUser(user, data) {
    user.send(data);
}
//TODO: fix message type
function findAgentForTask(message) {
    let task = message.task;
    agents.forEach(agent => {
        if (agent.specs.os, agent.specs.cpu, agent.specs.gpu, agent.specs.ram == task.specs.os, task.specs.cpu, task.specs.gpu, task.specs.ram) {
            return agent;
        }
    });
    return null;
}
//Gets the specs for all currently connected clients
app.get('/specs', (req, res) => {
    if (agents.length == 0) {
        console.log("Could not retrieve specs. No agents are connected");
        return res.sendStatus(404);
    }
    let result = [];
    agents.forEach((agent) => {
        result.push({
            "name": agent.name,
            "specs": {
                "os": agent.specs.os,
                "gpu": agent.specs.gpu,
                "cpu": agent.specs.cpu,
                "ram": agent.specs.ram
            }
        });
    });
    return res.json(result);
});
main();
