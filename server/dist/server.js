"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const url = __importStar(require("url"));
const flatbuffers = __importStar(require("flatbuffers"));
const hwfSchema_generated_1 = require("./hwfSchema_generated");
const mongo_db_1 = require("./db/mongo_db");
const cors_1 = __importDefault(require("cors"));
const flatbufferHelper_1 = require("./flatbufferHelper");
const fHelper = new flatbufferHelper_1.FlatbufferHelper();
const app = express_1.default();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });
const userServer = http.createServer(app);
const userWss = new ws.Server({ server: userServer });
//connect to the database:
const db = new mongo_db_1.dbAdapter();
app.use(express_1.default.json());
app.use(cors_1.default({
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
//TODO: Fix specs typing (get rid of string[] type)
class Agent {
    constructor(ws) {
        this.isIdle = true;
        this.socket = ws;
    }
}
wss.on('connection', (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    let agent = addAgent(ws);
    console.log(`\nNew Daemon connected from [${req.socket.remoteAddress}].`);
    // save the new daemon in the 
    let temp = 1;
    let ip = req.socket.remoteAddress;
    if (ip !== undefined) {
        //let id = await db.addDaemon(ip)
        //console.log(`added new daemon with id: ["${id}"]`)
        agent.name = "testname (" + temp + ")";
        temp++;
    }
    // don't send this message right now, 
    // we only want to send Message bin for testing
    // ws.send("You have connected to the server!")
    //Saves the specs that were sent in the URL. TODO: Proper handling of empty or missing fields
    let queries = url.parse(req.url, true).query;
    agent.specs = { "os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"], };
    console.log("Agent specs:");
    console.log(agent.specs);
    ws.on("message", (message) => {
        console.log("\nws.onMessage from [Daemon]");
        console.log(`Recieved message: ["${message}"] from Daemon: [${agent.name}] `);
        //ws.send("The server recieved your message")
    });
    ws.on('close', () => {
        console.log(`Client "${agent.name}" disconnected`);
    });
}));
userWss.on("connection", (ws, req) => {
    console.log(`\nNew User-client connected from [${req.socket.remoteAddress}].`);
    ws.on("message", (binaryMessage) => {
        /*
            TASK = 1
            RESULT = 2
            GET_RESULT = 2
            HARDWARE_POOL = 3
            GET_HARDWARE_POOL = 3
            FILE = 4
        */
        switch (fHelper.getFlatbufferType(binaryMessage)) {
            case 1: {
                console.log("\nws.onMessage from [Client]");
                let message = fHelper.readFlatbufferBinary(binaryMessage);
                //console.log(JSON.stringify(message))
                //console.log(message.task.hardware)
                //console.log(message.task.stages[0])
                //console.log(`Artifact 0: [${message.task.artifacts.files[0]}]`)
                console.log(JSON.stringify(message.task));
                db.addTask(JSON.stringify(message.task));
                let agent = agents[0];
                sendToAgent(binaryMessage, agent);
            }
            case 2: {
            }
            case 3: {
            }
            case 4: {
            }
        }
    });
});
function addAgent(socket) {
    let agent = new Agent(socket);
    agents.push(agent);
    db.addDaemon(JSON.stringify({ 'ip': agent.ip, 'specs': agent.specs })).then(result => {
        agent.id = result;
    });
    //console.log(agent)
    return agent;
}
//TODO: implement this properly
function sendToUser(data, user) {
    user.send(data);
}
function sendToAgent(message, agent) {
    if (agent) {
        try {
            agent.socket.send(message);
            // save task to database
            let buf = new flatbuffers.ByteBuffer(message);
            let fbMessage = hwfSchema_generated_1.schema.Message.getRootAsMessage(buf);
            if (fbMessage.type() == 1) {
                //console.log("message type is 1. continuing...")
                /*
                let stageCommands:string[] = []
                let fbTask = fbMessage.task()
                
                if (fbTask == null){return 1}
                for (let stage = 0; stage < fbTask.stagesLength(); stage++) {
                    let fbStage = fbTask.stages(stage)

                    for (let cmd = 0; cmd < fbStage!.cmdListLength(); cmd++) {
                        stageCommands.push(fbStage!.cmdList(cmd))
                    }
                }

                if (stageCommands !== null){

                    // to-do: this needs to add a full task
                    // with stages and all
                    db.addTask(stageCommands)
                }
                */
                return 200;
            }
        }
        catch (err) {
            console.error("Could not send data to agent");
            console.error(err);
            return 500;
        }
    }
    else if (!agent) {
        console.error("Agent with given id could not be found");
        return 404;
    }
    else {
        console.error("You should not be here");
        return 500;
    }
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
/*
//TODO: implement this
app.post('/createNewJob', (req, res) => {
    let newMessage = req.body.message //string
    let newHardwareParameters = req.body.hardwareParameters //array
    
    //call function to find appropriate client -> return correct websocket
    //ws.send send message to client
    //wait for response
    //save data in database
    //res.status(200).json({status: true, time: number })
})*/
/*
//TODO: implement this
app.get('/abortTask'), (req:Request, res:Response) => {
    //Get ID, send "cancelling message" to agent, wait for confirmation from agent.
    return;
}*/
userServer.listen(3001, () => {
    console.log("Userserver listening on port: 3001");
});
server.listen(9000, () => {
    console.log("Listening on port: 9000");
});
