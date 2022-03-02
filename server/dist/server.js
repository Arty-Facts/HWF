"use strict";
exports.__esModule = true;
var http = require("http");
var ws = require("ws");
var express = require("express");
var url = require("url");
var flatbuffers = require("flatbuffers");
var message_1 = require("./message");
var schema_generated_1 = require("./schema_generated");
var bodyparser = require("body-parser");
//let bodyparser = express.raw()
var app = express();
var server = http.createServer(app);
var wss = new ws.Server({ server: server });
//const userApp = express()
var userServer = http.createServer(app);
var userWss = new ws.Server({ server: userServer });
app.use(express.json());
// TODO: Implement cors? Is it even needed?
// app.use(cors({
//     origin:"*",
//     methods: ["GET", "POST", "PUT", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "*"]
// }))
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
wss.on('connection', function (ws, req) {
    //Gives a WebSocket a name and an incrementing id.
    //TODO: Improve ID-system
    ws.id = idnum;
    ws.name = "testname" + idnum;
    idnum++;
    //socket.remoteAddress gets the connecting client's IP
    console.log("New client \"".concat(ws.name, "\" connected from ").concat(req.socket.remoteAddress, ". Given id ").concat(ws.id, " "));
    ws.send("You have connected to the server!");
    //Saves the specs that were sent in the URL. TODO: Proper handling of empty or missing fields
    var queries = url.parse(req.url, true).query;
    ws.specs = { "os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"] };
    console.log("Agent specs:");
    console.log(ws.specs);
    wss.clients.forEach(function (client) { console.log(client.id); });
    ws.on("message", function (message) {
        console.log("ws.onMessage jhfdgjkhsgfkjsdhgkjhdflkgjhdfkjgh");
        console.log("Recieved message from ".concat(ws.name, ": \"").concat(message, "\""));
        ws.send("The server recieved your message");
    });
    ws.on('close', function () {
        console.log("Client \"".concat(ws.name, "\" (id ").concat(ws.id, ") disconnected"));
    });
});
userWss.on("connection", function (ws, req) {
    ws.on("message", function (message) {
        // console.log("User message: ", message)
        // console.log("typeof: ", typeof message)
        // let reqBodyBytes = new Uint8Array(message as )
        var buf = new flatbuffers.ByteBuffer(message);
        //let msg = Message.getRootAsMessage(buf)
        //let msg = HelloWorld.getRootAsHelloWorld(buf)
        var msg = schema_generated_1.HelloWorld.HelloWorld.getRootAsHelloWorld(buf);
        //let agentId:number = msg.agentId()
        var agentId = 999;
        sendToAgent((message), agentId);
    });
});
//Gets the agent with matching ID from wss.client. This is based on the ID given when the agent connected.
function getAgent(agentId) {
    var matchedAgent = undefined;
    wss.clients.forEach(function (client) {
        if (client.id == agentId) {
            matchedAgent = client;
            return;
        }
    });
    return matchedAgent;
}
//TODO: Read agent id from incoming data, then send to agent
//TODO: This can probably be cleaned up and done with fewer if/else-statements
function sendToAgent(data, agentId) {
    //From data, read agent id
    var agent = getAgent(agentId);
    if (agent) {
        try {
            //Send data onwards to agent
            agent.send(data);
            console.log("Data sent to agent ".concat(agentId));
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
app.get('/specs', function (req, res) {
    console.log("retrieving agents specs");
    if (wss.clients.size == 0) {
        console.log("No agents are connected");
        return res.sendStatus(404);
    }
    var result = [];
    wss.clients.forEach(function (client) {
        var _a = client, id = _a.id, name = _a.name, specs = _a.specs;
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
    return res.json(result);
});
//Sends data to the agent with matching ID
//TODO: Error-handling (no data, invalid ID format/type etc...)
app.post('/sendToAgent', bodyparser.raw(), function (req, res) {
    //Parses the incoming byte-array using the flatbuffers schema for these messages, then reads the agent id the message will be sent onwards to
    var reqBodyBytes = new Uint8Array(req.body);
    var buf = new flatbuffers.ByteBuffer(reqBodyBytes);
    var msg = message_1.Message.getRootAsMessage(buf);
    var agentId = msg.agentId();
    res.sendStatus(sendToAgent(reqBodyBytes, agentId));
});
//TODO: implement this
app.post('/createNewJob', function (req, res) {
    var newMessage = req.body.message; //string
    var newHardwareParameters = req.body.hardwareParameters; //array
    //call function to find appropriate client -> return correct websocket
    //ws.send send message to client
    //wait for response
    //save data in database
    //res.status(200).json({status: true, time: number })
});
//TODO: implement this
app.get('/abortTask'), function (req, res) {
    //Get ID, send "cancelling message" to agent, wait for confirmation from agent.
    return;
};
app.get('/', function (req, res) { return res.send("bla"); });
userServer.listen(3001, function () {
    console.log("Userserver listening on port: 3001");
});
server.listen(3000, function () {
    console.log("Listening on port: 3000");
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
