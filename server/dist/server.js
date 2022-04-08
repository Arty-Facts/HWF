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
const message_generated_1 = require("./message_generated");
const bodyparser = __importStar(require("body-parser"));
const mongo_db_1 = require("./db/mongo_db");
const cors_1 = __importDefault(require("cors"));
//let bodyparser = express.raw()
const app = (0, express_1.default)();
const server = http.createServer(app);
const wss = new ws.Server({ server: server });
//const userApp = express()
const userServer = http.createServer(app);
const userWss = new ws.Server({ server: userServer });
//connect to the database:
const db = new mongo_db_1.dbAdapter();
app.use(express_1.default.json());
// TODO: Implement cors? Is it even needed?
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "*"]
}));
//TODO:Look up how to recieve several sockets asynchronously
// req is a httpincomingmessage -> https://www.w3schools.com/nodejs/obj_http_incomingmessage.asp
//TODOs & General thoughts: 
//How do we differentiate agent-clients and user-clients? Is this even needed in practice?
//Should agents be able to name themselved when connecting? The daemon could maybe pick the systems own name automatically when first connecting
//We should save info about connected agents even after they disconnect (currently nothing is saved for a disconnected client). That way their name, id & info could be "reserved" in case of a temporary diconnect
//According to what i've read ws doesn't propely close a socket if it's disconnected improperly (such as a network cable getting unplugged). We should test this (and solve it if necessary)
//Should something be logged to a file? That being things that aren't saved in the DB, such as connects/disconnects.
//Maybe add timestamps to log messages? ("[2022-03-13, 16:33:24] Error: bla bla bla")
//Should the server know which user started a task, or is it anonymous?
//Testing, how, when?
var idnum = 1;
class Task {
}
class Agent {
}
wss.on('connection', (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    //Gives a WebSocket a name and an incrementing id.
    //TODO: Improve ID-system
    //ws.id = idnum
    //ws.name = "testname" + idnum 
    //idnum++
    //socket.remoteAddress gets the connecting client's IP
    console.log(`New client "${ws.name}" connected from ${req.socket.remoteAddress}. Given id ${ws.id} `);
    // save the new daemon in the database
    let ip = req.socket.remoteAddress;
    if (ip !== undefined) {
        let id = yield db.addDaemon(ip);
        console.log(`added new daemon with id: "${id}"`);
        ws.id = id;
        ws.name = "testname (" + id + ")";
    }
    // don't send this message right now, 
    // we only want to send Message bin for testing
    // ws.send("You have connected to the server!")
    //Saves the specs that were sent in the URL. TODO: Proper handling of empty or missing fields
    let queries = url.parse(req.url, true).query;
    ws.specs = { "os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"], };
    console.log("Agent specs:");
    console.log(ws.specs);
    wss.clients.forEach((client) => { console.log(client.id); });
    ws.on("message", (message) => {
        console.log("ws.onMessage jhfdgjkhsgfkjsdhgkjhdflkgjhdfkjgh");
        console.log(`Recieved message from ${ws.name}: "${message}"`);
        //ws.send("The server recieved your message")
    });
    ws.on('close', () => {
        console.log(`Client "${ws.name}" (id ${ws.id}) disconnected`);
    });
}));
userWss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        // console.log("User message: ", message)
        // console.log("typeof: ", typeof message)
        //let reqBodyBytes = new Uint8Array(message as )
        //let buf = new flatbuffers.ByteBuffer(message)
        //let msg = Message.getRootAsMessage(buf)
        //let msg = HelloWorld.getRootAsHelloWorld(buf)
        /*let msg = HelloWorld.HelloWorld.getRootAsHelloWorld(buf)*/
        //let agentId:number = msg.agentId()
        /*let agentId:number = 999*/
        //sendToAgent((message), agentId)
        sendToAgent(message);
    });
});
function getAvailableAgent() {
    //let matchedAgent:WebSocket | undefined = undefined;
    /*
    // to-do: change this to a get of first elem?
    // does this actually work? are all wss.clients still connected?
    wss.clients.forEach(client => {
        // return the first agent
        matchedAgent = client
        return
    });
    */
    let [agent] = wss.clients;
    return agent;
}
// Gets the agent with matching ID from wss.client. This is based on the ID given when the agent connected.
function getAgent(agentId) {
    let matchedAgent = undefined;
    wss.clients.forEach(client => {
        // ((client as NamedWebSocket).OPEN
        if (client.id == agentId) {
            matchedAgent = client;
            return;
        }
    });
    return matchedAgent;
}
function sendToAgent(data) {
    let agent = getAvailableAgent();
    if (agent) {
        let named_agent = agent;
        try {
            // send data onwards to agent
            named_agent.send(data);
            console.log(`Data sent to agent ${named_agent.id}`);
            // save task to database
            let buf = new flatbuffers.ByteBuffer(data);
            let msg = message_generated_1.Message.getRootAsMessage(buf);
            // get all commands from flatbuffer
            let commands = [];
            for (let i = 0; i < msg.cmdLength(); i++) {
                commands[i] = msg.cmd(i);
                console.log(`Read cmd: ${msg.cmd(i)}`);
            }
            if (commands !== null) {
                db.addTask(commands);
            }
            return 200;
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
//TODO: Read agent id from incoming data, then send to agent
//TODO: This can probably be cleaned up and done with fewer if/else-statements
function sendToAgentWithId(data, agentId) {
    //From data, read agent id
    let agent = getAgent(agentId);
    if (agent) {
        try {
            //Send data onwards to agent
            agent.send(data);
            console.log(`Data sent to agent ${agentId}`);
            return 200;
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
    console.log("retrieving agents specs");
    if (wss.clients.size == 0) {
        console.log("No agents are connected");
        return res.sendStatus(404);
    }
    let result = [];
    wss.clients.forEach((client) => {
        const { id, name, specs } = client;
        result.push({
            "id": id,
            "name": name,
            "specs": {
                "os": specs.os,
                "gpu": specs.gpu,
                "cpu": specs.cpu,
                "ram": specs.ram
            }
        });
    });
    console.log(result);
    return res.json(result);
});
/*
[
    {
        "id": 1,
        "name": "testname1",
        "specs": {}
    },
    {
        "id": 2,
        "name": "testname2",
        "specs": {
            "os": "windows10",
            "gpu": "5700xt",
            "cpu": "r5_3600",
            "ram": "16gb"
        }
    }
]
*/
// ws.send("The server recieved your message")
//         return res.sendStatus(404)
//     }
//     let result:{}[] = []
//     wss.clients.forEach( (client) => {
//         const {id, name, specs} = (client as NamedWebSocket)
//         result.push({
//             "id": id, 
//             "name": name, 
//             "specs":{
//                 "os": specs.os, 
//                 "gpu": specs.gpu, 
//                 "cpu": specs.cpu, 
//                 "ram": specs.ram
//             }
//         })
//     })
//     return res.json(result)   
// })
//Sends data to the agent with matching ID
//TODO: Error-handling (no data, invalid ID format/type etc...)
app.post('/sendToAgent', bodyparser.raw(), (req, res) => {
    //Parses the incoming byte-array using the flatbuffers schema for these messages, then reads the agent id the message will be sent onwards to
    let reqBodyBytes = new Uint8Array(req.body);
    //let buf = new flatbuffers.ByteBuffer(reqBodyBytes)
    //let msg = Message.getRootAsMessage(buf)
    //let agentId:string|null = msg.agentId()
    //res.sendStatus(sendToAgent(reqBodyBytes, agentId))
    res.sendStatus(sendToAgent(reqBodyBytes));
});
/*
// :D
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
/*
app.get('/', (req,res) => res.send("bla"))
*/
userServer.listen(3001, () => {
    console.log("Userserver listening on port: 3001");
});
server.listen(9000, () => {
    console.log("Listening on port: 9000");
});
//TODO:
//Users send tasks
/*
    - Server recieves request on appropriate endpoint ("/something")
    - Checks if one of the connected clients fit the users required specs
    - If no matching agent is found, notify the user
*/
//A client should connect to the server
/*
    - The server listend on port 3000 and saves incoming WebSocket connections
    - Saves info about the connection in a good place (currently wss.clients)
*/
//The server can send a task from a user to an agent
/*
    - If the users spec requirements matches an agent then the task is sent onwards
    
 */
//The server should save info in a database
/*
    - Save data from an agents response in the database
*/
//You should be able to get data from the database
/*
    - The frontend should be able to request its users data from the database
*/
// ===================
