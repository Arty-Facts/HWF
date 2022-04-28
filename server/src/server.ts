import * as  http from "http"
import * as  ws from 'ws'
import {WebSocket, WebSocketServer} from 'ws'
import {Request, Response,} from 'express'
import express from 'express'
import * as  url from "url"
import { ParsedUrlQuery } from "querystring";
import * as flatbuffers from "flatbuffers"
import { schema } from "./hwfSchema_generated"
import { dbAdapter } from "./db/mongo_db"
import cors from "cors"

import { FlatbufferHelper } from "./flatbufferHelper"
const fbHelper = new FlatbufferHelper()

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

function main(){
    var loadBalancer = new LoadBalancer("fifo")
    loadBalancer.queue = new Queue()

    userServer.listen(3001, () => {
        console.log("Userserver listening on port: 3001")
    })
    
    server.listen(9000, () => {
    
    
        console.log("Listening on port: 9000") 
    })
}

class Agent {
    socket:WebSocket
    ip:string;
    name:string; //Should this be used?
    id:string | Promise<string>; //TODO: fix so that this does not have to accept a promise type
    specs:{
        "os": string | undefined | null, 
        "gpu": string | undefined | null, 
        "cpu": string | undefined | null, 
        "ram": string | undefined | null
    };
    isIdle:boolean;

    //used when agent is performing a task
    currentTask:string | null;
    taskStartTime:string | null;

    constructor(ws:WebSocket) {
        this.socket = ws
        this.isIdle = true
    }

    send(data:Uint8Array) {
        this.socket.send(data)
    }
}

class Queue {

    contents:[Uint8Array]

    enqueue(data: Uint8Array, index?: number): void {
        if (index) {
            this.contents.splice(index, 0, data)
        }

        else {
        this.contents.push(data)
        }
    }

    dequeue(target: Uint8Array | number): void {
    
        if (typeof target == "number") {
            this.contents.splice(target, 0)
        }

        else {
            this.contents.splice(this.contents.indexOf(target), 0) 
        }
    }

    size(): number {
        return this.contents.length
    }
}

class LoadBalancer {

    queue:Queue
    priorityType: string //fifo, lifo, random, more?

    queueTask(task:Uint8Array): void {
        this.queue.enqueue(task)
    }

    retryQueuedTasks(){
        if (this.priorityType == "fifo") {
            this.queue.contents.reverse().forEach(task => {
                let agent = findAgentForTask(task)
                if (agent != null && agent.isIdle ) {
                    agent.send(task)
                    this.queue.dequeue(task)
                }
            });
        }

        else if (this.priorityType == "lifo") {
            this.queue.contents.forEach(task => {
                let agent = findAgentForTask(task)
                if (agent != null && agent.isIdle ) {
                    agent.send(task)
                    this.queue.dequeue(task)
                }
            });
        }
    }
    
    constructor(priority?: "fifo" | "lifo" | "random" ) { //TODO: implement proper support for all priority types
        if (priority){
            this.priorityType = priority
        }
        else {
            priority = "fifo"
        }
    }
}

wss.on('connection', async (ws:WebSocket, req:http.IncomingMessage) => {

    let ip = req.socket.remoteAddress
    let url = req.url
    console.log(`\nNew Daemon connected from [${ip}].`)

    if (ip == undefined) {

        throw "Could not read ip of connecting agent, was undefined"
    }
    let agent = createAgent(ws, ip)

    // let queries:ParsedUrlQuery = url.parse(req.url!, true).query
    //agent.specs = {"os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"],}
    if (url != null) {
        agent.specs = {
            "os": url.match(/os=(\S+?)&/)![0], 
            "gpu": url.match(/gpu=(\S+?)&/)![0], 
            "cpu": url.match(/cpu=(\S+?)&/)![0], 
            "ram": url.match(/ram=(\S+?)$/)![0]}
    }
    console.log("Agent specs:")
    console.log(agent.specs)
    
    ws.on("message", (message:Uint8Array | string) => {
        console.log("\nws.onMessage from [Daemon]")
        console.log(`Recieved message: ["${message}"] from Daemon: [${agent.name}] `)
    })
    
    ws.on('close', () => {
        console.log(`Client "${agent.name}" disconnected`)
    })
})


userWss.on("connection", (ws:WebSocket, req:http.IncomingMessage) => {

    console.log(`\nNew User-client connected from [${req.socket.remoteAddress}].`)

    ws.on("message", (message:Uint8Array) => {

        let readableMessage = fbHelper.readFlatbufferBinary(message)

        let agent = findAgentForTask(readableMessage)
        if (agent == null){
            sendToUser(ws, "No fitting agent could be found for this task") //TODO: add way to force queuing of task even if no matching agent is connected?
        }
        else if (agent.isIdle)
        {
        agent.send(message)
        }
        else {
            
        }
    })

})

//TODO: expand this to include all agent fields, not just the ip
function saveAgentInDb(agent:Agent): string | Promise<string> {
    let id = db.addDaemon(agent.ip)
    console.log(`added new agent with id: ["${id}"]`)

    return id
}
function createAgent(socket:WebSocket, ip:string): Agent {
    let agent = new Agent(socket)
    agents.push(agent)
    agent.ip = ip
    agent.id = db.addDaemon(agent.ip)
    return agent
}
//TODO: implement this properly
function sendToUser(user:WebSocket, data:any): void {
    user.send(data)
}
//TODO: fix message type
function findAgentForTask(message:any): Agent | null {
    let task = message.task
    agents.forEach(agent => {
        if (agent.specs.os, agent.specs.cpu, agent.specs.gpu, agent.specs.ram == task.specs.os, task.specs.cpu, task.specs.gpu, task.specs.ram) {
            return agent
        }
    });
    return null

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

main()