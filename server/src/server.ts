
import * as  http from "http"
import * as  ws from 'ws'
import {Data, WebSocket, WebSocketServer} from 'ws'
import {Request, Response,} from 'express'
import express from 'express'
import * as  url from "url"
import { ParsedUrlQuery } from "querystring";
import * as flatbuffers from "flatbuffers"
import * as fs from "fs"
import { Message } from "./message"
import { HelloWorld } from "./schema_generated"
import * as bodyparser from "body-parser";
import { dbAdapter } from "./db/mongo_db"


//let bodyparser = express.raw()
const app = express()
const server = http.createServer(app)
const wss:WebSocketServer = new ws.Server({ server:server });

//const userApp = express()
const userServer = http.createServer(app)
const userWss = new ws.Server({server:userServer})

app.use(express.json())

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
    
var idnum:number = 1

//Extends ws's WebSocket with support for id, name and specs
//TODO: Specs keys should really only store strings or possibly undefined depending on how empty fields are handled in the future. So string[] should be gotten rid of.
interface NamedWebSocket extends WebSocket {
    name:string;
    id:number;
    specs:{
        "os": string | string[] | undefined, 
        "gpu": string | string[] | undefined, 
        "cpu": string | string[] | undefined, 
        "ram": string | string[] | undefined
    };

}

class Task {
    id:string; // <- should we have an id for each task?
    timestamp:string;

    cmd:string;
    files:string[];

    // if the task has been assigned:
    daemon:string;
    status:string;
}

class Agent {
    id:string;
    ip:string;

    os:string;
    gpu:string;
    cpu:string;
    ram:string;

    // currently assigned info:
    task:string;
    timestamp:string; // when task was assigned
}

wss.on('connection', (ws:NamedWebSocket, req:http.IncomingMessage) =>{
   
    //Gives a WebSocket a name and an incrementing id.
    //TODO: Improve ID-system
    ws.id = idnum
    ws.name = "testname" + idnum 
    idnum++
    
    //socket.remoteAddress gets the connecting client's IP
    console.log(`New client "${ws.name}" connected from ${req.socket.remoteAddress}. Given id ${ws.id} `)
    
    // don't send this message right now, 
    // we only want to send Message bin for testing
    // ws.send("You have connected to the server!")
    

    //Saves the specs that were sent in the URL. TODO: Proper handling of empty or missing fields
    let queries:ParsedUrlQuery = url.parse(req.url!, true).query
    ws.specs = {"os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"],}
    console.log("Agent specs:")
    console.log(ws.specs)
    
    wss.clients.forEach((client) => {console.log((client as NamedWebSocket).id)})
    
    
    ws.on("message", (message) => {
        console.log("ws.onMessage jhfdgjkhsgfkjsdhgkjhdflkgjhdfkjgh")
        console.log(`Recieved message from ${ws.name}: "${message}"`)
        
        //ws.send("The server recieved your message")
    })
    

    ws.on('close', () => {
        console.log(`Client "${ws.name}" (id ${ws.id}) disconnected`)
        
    })
})

userWss.on("connection", (ws, req) => {

    ws.on("message", (message:Uint8Array) => {
        // console.log("User message: ", message)
        // console.log("typeof: ", typeof message)
        //let reqBodyBytes = new Uint8Array(message as )

        let buf = new flatbuffers.ByteBuffer(message)
        let msg = Message.getRootAsMessage(buf)

        //let msg = HelloWorld.getRootAsHelloWorld(buf)

        /*let msg = HelloWorld.HelloWorld.getRootAsHelloWorld(buf)*/

        let agentId:number = msg.agentId()

        /*let agentId:number = 999*/
    
        //sendToAgent((message), agentId)
        sendToAgent(message)
    })

})

function getAvailableAgent(){
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

    let [agent] = wss.clients

    return agent
}

// Gets the agent with matching ID from wss.client. This is based on the ID given when the agent connected.
function getAgent(agentId:number){
    
    let matchedAgent:WebSocket | undefined = undefined;

    wss.clients.forEach(client => {
        if ((client as NamedWebSocket).OPEN == agentId) {
            matchedAgent = client
            return
        }  
    });

    return matchedAgent
}


function sendToAgent(data:Uint8Array) {
    let agent:WebSocket | undefined = getAvailableAgent()

    if (agent) {

        let named_agent = (agent as unknown as NamedWebSocket)

        try {
            //Send data onwards to agent
            named_agent.send(data)
            console.log(`Data sent to agent ${named_agent.id}`)
            return 200
        }
        catch (err) {
            console.error("Could not send data to agent")
            console.error(err)
            return 500
        }
    }
    else if (!agent){
        console.error("Agent with given id could not be found")
        return 404
    }
    else {
        console.error("You should not be here")
        return 500
    }
}

//TODO: Read agent id from incoming data, then send to agent
//TODO: This can probably be cleaned up and done with fewer if/else-statements
function sendToAgentWithId(data:Uint8Array, agentId:number) {

    //From data, read agent id
    let agent:WebSocket | undefined = getAgent(agentId)

    if (agent) {

        try {
            //Send data onwards to agent
            (agent as unknown as WebSocket).send(data)
            console.log(`Data sent to agent ${agentId}`)
            return 200
        }
        catch (err) {
            console.error("Could not send data to agent")
            console.error(err)
            return 500
        }
    }
    else if (!agent){
        console.error("Agent with given id could not be found")
        return 404
    }
    else {
        console.error("You should not be here")
        return 500
    }

}
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
app.post('/sendToAgent', bodyparser.raw(), (req:Request,res:Response) => {
    
    //Parses the incoming byte-array using the flatbuffers schema for these messages, then reads the agent id the message will be sent onwards to
    let reqBodyBytes = new Uint8Array(req.body)
    let buf = new flatbuffers.ByteBuffer(reqBodyBytes)
    let msg = Message.getRootAsMessage(buf)
    let agentId:number = msg.agentId()


    //res.sendStatus(sendToAgent(reqBodyBytes, agentId))
    res.sendStatus(sendToAgent(reqBodyBytes))
    
})

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
    console.log("Userserver listening on port: 3001")
})

server.listen(3000, () => {

    console.log("Listening on port: 3000") 
})


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

