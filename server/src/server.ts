import * as  http from "http"
import * as  ws from 'ws'
import {Data, WebSocket, WebSocketServer} from 'ws'
import {Request, Response,} from 'express'
import express from 'express'
import * as  url from "url"
import { ParsedUrlQuery } from "querystring";
import * as flatbuffers from "flatbuffers"
import * as fs from "fs"
import { schema } from "./hwfSchema_generated"
import * as bodyparser from "body-parser";
import { dbAdapter } from "./db/mongo_db"
import cors from "cors"

import { FlatbufferHelper } from "./flatbufferHelper"
const fHelper = new FlatbufferHelper()

const app = express()

const server = http.createServer(app)
const wss:WebSocketServer = new ws.Server({ server:server });

const userServer = http.createServer(app)
const userWss = new ws.Server({server:userServer})

//connect to the database:
const db = new dbAdapter()

app.use(express.json())
app.use(cors({
     origin:"*",
     methods: ["GET", "POST", "PUT", "OPTIONS"],
     allowedHeaders: ["Content-Type", "*"]
 }))

//TODOs & General thoughts: 
    //Should agents be able to name themselved when connecting? The daemon could maybe pick the systems own name automatically when first connecting
    //We should save info about connected agents even after they disconnect (currently nothing is saved for a disconnected client). That way their name, id & info could be "reserved" in case of a temporary diconnect
    //According to what i've read ws doesn't propely close a socket if it's disconnected improperly (such as a network cable getting unplugged). We should test this (and solve it if necessary)
    //Should something be logged to a file? That being things that aren't saved in the DB, such as connects/disconnects.
    //Maybe add timestamps to log messages? ("[2022-03-13, 16:33:24] Error: bla bla bla")

var agents:Agent[] = []

class Agent {
    socket:WebSocket
    ip:string;
    name:string;
    specs:{
        "os": string | undefined, 
        "gpu": string | undefined, 
        "cpu": string | undefined, 
        "ram": string | undefined
    };

    // currently assigned info:
    task:string;
    timestamp:string; // when task was assigned
    isIdle:boolean = true;


    constructor(ws:WebSocket){
        this.socket = ws
    }
}

wss.on('connection', async (ws:WebSocket, req:http.IncomingMessage) =>{

    let agent = addAgent(ws)
    console.log(`\nNew Daemon connected from [${req.socket.remoteAddress}].`)

    // save the new daemon in the 
    let temp:number = 1
    let ip = req.socket.remoteAddress

    if (ip !== undefined){
        let id = await db.addDaemon(ip)
        console.log(`added new daemon with id: ["${id}"]`)
        agent.name = "testname (" + temp + ")"
        temp++
    }

    // don't send this message right now, 
    // we only want to send Message bin for testing
    // ws.send("You have connected to the server!")
    
    //Saves the specs that were sent in the URL. TODO: Proper handling of empty or missing fields
    let queries:ParsedUrlQuery = url.parse(req.url!, true).query
    agent.specs = {"os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"],}
    console.log("Agent specs:")
    console.log(agent.specs)
    
    ws.on("message", (message) => {
        console.log("\nws.onMessage from [Daemon]")
        console.log(`Recieved message: ["${message}"] from Daemon: [${agent.name}] `)
        
        //ws.send("The server recieved your message")
    })
    
    ws.on('close', () => {
        console.log(`Client "${agent.name}" disconnected`)
        
    })
})

userWss.on("connection", (ws, req) => {
    console.log(`\nNew User-client connected from [${req.socket.remoteAddress}].`)
    ws.on("message", (message:Uint8Array) => {
        
        console.log("\nws.onMessage from [Client]")
        let testmessage = fHelper.readFlatbufferBinary(message)
        console.log(testmessage)
        console.log(testmessage.task.stages[0])
        console.log(`Artifact 0: [${testmessage.task.artifacts.files[0]}]`)
  

        let agent = agents[0]
        sendToAgent(message, agent)
    })

})

function addAgent(socket:WebSocket){
    let agent = new Agent(socket)
    agents.push(agent)
    return agent
}
//TODO: implement this properly
function sendToUser(data:any, user:WebSocket){
    user.send(data)
}

function sendToAgent(data:Uint8Array, agent:Agent) {

    if (agent) {

        try {
            agent.socket.send(data)

            // save task to database
            let buf = new flatbuffers.ByteBuffer(data)
            let fbMessage = schema.Message.getRootAsMessage(buf)

            if (fbMessage.type() == 1) {
                //console.log("message type is 1. continuing...")
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

                return 200
            }
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

//Gets the specs for all currently connected clients
app.get('/specs', (req:Request, res:Response) => {
    
    if (agents.length == 0) {    
        console.log("Could not retrieve specs. No agents are connected")
        return res.sendStatus(404)
    }

    let result:{}[] = []
    agents.forEach( (agent) => {
        result.push({
            "name": agent.name, 
            "specs":{
                "os": agent.specs.os, 
                "gpu": agent.specs.gpu, 
                "cpu": agent.specs.cpu, 
                "ram": agent.specs.ram
            }
        })
    })
    return res.json(result)   

})


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
    console.log("Userserver listening on port: 3001")
})

server.listen(9000, () => {


    console.log("Listening on port: 9000") 
})

