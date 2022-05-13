import { createServer, IncomingMessage } from "http"
import * as  ws from 'ws'
import {WebSocket} from 'ws'
import {Request, response, Response,} from 'express'
import express from 'express'
import { dbAdapter } from "./db/mongo_db"
import cors from "cors"

import { FlatbufferHelper, Task } from "./flatbufferHelper"
const fbHelper = new FlatbufferHelper()

const app = express()

const server = createServer(app)
const wss:ws.WebSocketServer = new ws.Server({ server:server });
const userServer = createServer(app)
const userWss = new ws.Server({server:userServer})

//connect to the database:
const db = new dbAdapter()

app.use(express.json())
app.use(cors({
     origin:"*",
     methods: ["GET", "POST", "PUT", "OPTIONS"],
     allowedHeaders: ["Content-Type", "*"]
 }))

//General thoughts: 
    //Should agents be able to name themselved when connecting? The daemon could maybe pick the systems own name automatically when first connecting
    //We should save info about connected agents even after they disconnect (currently nothing is saved for a disconnected client). That way their name, id & info could be "reserved" in case of a temporary diconnect
    //According to what i've read ws doesn't propely close a socket if it's disconnected improperly (such as a network cable getting unplugged). We should test this (and solve it if necessary)
    //Should something be logged to a file? That being things that aren't saved in the DB, such as connects/disconnects.
    //Maybe add timestamps to log messages? ("[2022-03-13, 16:33:24] Error: bla bla bla")

//TODO: KNOWN BUGS
    // 1) Adding a task to the queue when a matching agent is not connected 
    //    and then connecting with a matching agent will not always properly send the task to that agent immediately after it's connected.
    //    It usually works, but it has failed a couple of times so far.
    //
    // 2) The agents id appears to be set to "true" instead of the id returned by addDaemon() for some reason

class Agent {
    socket:WebSocket
    ip:string;
    name:string; //Should this be used?
    id:string;
    specs:{
        "os": string | undefined | null, 
        "gpu": string | undefined | null, 
        "cpu": string | undefined | null, 
        "ram": string | undefined | null
    };
    isIdle:boolean;  //TODO: implement a way of returning an agent to idle state when it's finished
    isConnected:boolean;

    currentTask:string | null;
    taskStartTime:string | Date;

    constructor(ws:WebSocket) {
        this.socket = ws
        this.isIdle = true
    }

    send(data:Uint8Array, responseSocket: WebSocket, id?:string) {
        this.socket.send(data) //TODO: reply to python api here
        this.isIdle = false 

        if (id){
        responseSocket.send(`424 ${id}`)
    }
    }
}

class Queue {

    //Binary and the socket it was sent from
    contents:[Uint8Array, WebSocket, string][] = []

    enqueue(data: Uint8Array, socket:WebSocket, id:string): void {

        this.contents.push([data, socket, id])
    }

    dequeue(target: [Uint8Array, WebSocket, string] ): void {
    
        // if (typeof target == "number") {

        //     this.contents.splice(target, 1)
        // }
        this.contents.forEach(tuple => {

            if (tuple == target) {
                this.contents.splice(this.contents.indexOf(tuple), 1)
                console.log("YO WE FOUD IT :))))))))))))))))))))))))")
                return    
            }
        }); 
        //TODO: FIX THIS 
            console.log("Could not find tuple to be removed in the queue") 
    }
        
    size(): number {
        return this.contents.length
    }
}

class LoadBalancer {

    queue:Queue
    priorityType: string //fifo, lifo, random, more?

    queueTask(task:Uint8Array, socket:WebSocket, id:string): void {
        this.queue.enqueue(task, socket, id)
    }

    retryQueuedTasks(){
        console.log("Retrying all queued tasks")
        if (this.priorityType == "lifo") {
            this.queue.contents.reverse().forEach(tuple => {
                let agent = findAgentForTask(fbHelper.readFlatbufferBinary(tuple[0]))
                if (agent != null && agent.isIdle ) {
                    agent.send(tuple[0], tuple[1], tuple[2])
                    this.queue.dequeue(tuple)
                    return
                }
            });
        }

        else if (this.priorityType == "fifo") {
            this.queue.contents.forEach(tuple => {
                let agent = findAgentForTask(fbHelper.readFlatbufferBinary(tuple[0]))
                if (agent != null && agent.isIdle ) {
                    agent.send(tuple[0], tuple[1], tuple[2])
                    this.queue.dequeue(tuple)
                    return
                }
            });
        }

        else if (this.priorityType == "random"){
            let indexes = [...Array(this.queue.size()).keys()].map(i => i + 0);
            indexes.sort(() => (Math.random() > .5) ? 1: -1)
            for (let index in indexes) {
                 let tuple = this.queue.contents[index]
                 let agent = findAgentForTask(tuple[0])
                 if (agent != null && agent.isIdle ) {
                     agent.send(tuple[0], tuple[1], tuple[2])
                     this.queue.dequeue(tuple)
                     return
                }
            }
        }
    }
    
    constructor(priority?: "fifo" | "lifo" | "random" ) {
        if (priority){
            this.priorityType = priority
        }
        else {
            priority = "fifo"
        }
    }
}

async function createAgent(socket:WebSocket, ip:string, req:IncomingMessage): Promise<Agent> {

    let agent = new Agent(socket)
    agents.push(agent)
    agent.ip = ip
    let agentUrl = new URL(req.url as string, `http://${req.headers.host}`)
    let params = new URLSearchParams(agentUrl.search)
    agent.specs = {"os": params.get("os"), "gpu": params.get("gpu"), "cpu": params.get("cpu"), "ram": params.get("ram"),}
    
    await db.addDaemon(JSON.stringify({'ip':agent.ip, 'specs':agent.specs})).then(result => {
        agent.id = result 
    })
    return agent
}

//TODO: implement this properly
function sendToUser(user:WebSocket, data:any): void {

    user.send(data)
}

//TODO: fix message type, shouldn't be "any"
function findAgentForTask(message:any): Agent | null {

    let task = message.task
    console.log("Finding agent for this task:")
    console.log(task)
    for (let agent of agents) {
        if ( //TODO: Make this less hardcoded, loop through both instead?
                //agent.specs.os == task.hardware["os"] &&
                //agent.specs.cpu == task.hardware["cpu"] &&
                //agent.specs.gpu == task.hardware["gpu"] &&
                //agent.specs.ram == task.hardware["ram"]
                true
            ) 
            {
                return agent
            }
    };
    return null
}

//TODO: expand this with more validatable elements
function isValid(url:string|null|undefined = null):boolean {

    if(url){
        const result = ["os", "cpu", "gpu", "ram"].every(term => url.includes(term))
        return result
    }
    else {
        throw new Error("Trying to validate something that can't be validated")
    }
}

//TODO: expand this with more thorough comparisons
function doesAgentExist(connectingIp:string):boolean|Agent {
    for (let agent of agents){
        if (agent.ip == connectingIp){
            return agent
        }
    }
    return false
}



var agents:Agent[] = []
var balancer = new LoadBalancer("fifo")
balancer.queue = new Queue()
let currentDate = new Date()

wss.on('connection', async (ws:WebSocket, req:IncomingMessage) => {
    var agent:Agent
    let ip = req.socket.remoteAddress
    
    if (ip == undefined) {
        throw new Error("Could not read ip of connecting agent, was undefined")
    }
    else if (!isValid(req.url)){
        throw new Error("Agent connected with invalid URL")
    }

    console.log(`\nNew Daemon connected from [${ip}].`)
    
    let lookupResult:boolean|Agent = doesAgentExist(ip)
    if (!lookupResult) {
        console.log("IP not recognized from before, creating new agent object")
        agent = await createAgent(ws, ip, req!)
    }
    else{
        console.log("IP recognized, welcome back mr.agent")
        agent = lookupResult as Agent
        agent.isIdle = true

        if (agent.socket != ws) {
            agent.socket = ws
        }
    }

    agent.isConnected = true
    balancer.retryQueuedTasks()
    // console.log("Agent specs:")
    // console.log(agent.specs)
    
    ws.on("message", (message:Uint8Array | string ) => { 
        console.log("received message from daemon")
        
        console.log(`Recieved message: ["${message}"] from Daemon: [${agent.id}] `)
        if (message == "200"){
            agent.isIdle = true
        }
        
        balancer.retryQueuedTasks() //retrying tasks since the message from the daemon might be one that indicated it's finished and ready to accept a new task
    })
    
    ws.on('close', () => {
        console.log(`Agent from"${agent.ip}" disconnected`)
        agent.isConnected = false
    })
})

userWss.on("connection", (ws:WebSocket, req:IncomingMessage) => {
    var targetAgent:Agent
    ws.on("message", async (binaryMessage:Uint8Array) => {

        console.log(`\nNew User-client connected from [${req.socket.remoteAddress}].`)
        /*
            TASK = 1
            GET_RESULT = 2 
            HARDWARE_POOL = 3
            GET_HARDWARE_POOL = 3
            FILE = 4
            RESULT = 5
        */
        switch (fbHelper.getFlatbufferType(binaryMessage)){

            case 1: {

                let readableMessage = fbHelper.readFlatbufferBinary(binaryMessage)

                let agent = findAgentForTask(readableMessage)
                
                if (agent == null) {


                    console.log("no fitting agent could be found for this task")
                    ws.send("404")
                }

                else if (!agent.isConnected) {
                    targetAgent = agent!
                    console.log("Matching agent found, but it is not connected to the hub, queueing task")
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    balancer.queue.enqueue(binaryMessage, ws, id)
                    ws.send(`242 ${id}`)
                }

                else if (agent.isIdle) {
                    targetAgent = agent!
                    console.log("agent for task found, sending data")
                    agent.send(binaryMessage, ws)
                    agent.taskStartTime = currentDate

                    agent.isIdle = false
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    ws.send(`200 ${id}`)
                    
                }

                else {

                    console.log("agent is busy, adding task to queue")
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    balancer.queue.enqueue(binaryMessage, ws, id)
                    ws.send(`242 ${id}`)
                }
                break
            }
            case 2: {
                break
            }
            case 3: {
                break
            }
            case 4: {
                console.log("this is 4 :)")

                // to-do: send this to the correct agent!!!!!
                targetAgent.send(binaryMessage, ws)
                break
            }
        } 
    })
})

// function serverLog(text:string|object): void {
//     console.log(`[${currentDate}]` + text)
// }

//Gets the specs for all currently connected clients
app.get('/specs', (req:Request, res:Response) => {
    
    if (agents.length == 0) {    
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

app.get('/daemons', (req:Request, res:Response) => {
    if(agents.length == 0) {
        return res.sendStatus(404)
    }
    
    let result:{}[] = []
    agents.forEach( (agent) => {
        result.push({
            "name": agent.name,
            "ip": agent.ip,
            "id": agent.isIdle, 
            "specs":{
                "os": agent.specs.os, 
                "gpu": agent.specs.gpu, 
                "cpu": agent.specs.cpu, 
                "ram": agent.specs.ram
            },
            "idle": agent.isIdle,
            "connected": agent.isConnected,
            "current_task": agent.currentTask,
            "task_start_date": agent.taskStartTime
        })
    })
    return res.json(result)   

})

app.get('/queuedtasks', (req:Request, res:Response) => {
    if (balancer.queue.size() == 0){
        return res.sendStatus(404)
    }

    let result:{}[] = []
    for ( let taskBinary of balancer.queue.contents) {
        let fbMessage = fbHelper.readFlatbufferBinary(taskBinary[0])
        
       
        result.push({
            "target_hardware": fbMessage.messageBody.hardware,
            "stages": (fbMessage.messageBody as Task).stages,
            "artifacts": fbMessage.messageBody.artifacts
        })
        
    }

    return res.json(result)
})

userServer.listen(3001, () => {
    console.log("Userserver listening on port: 3001")
})

server.listen(9000, () => {
    console.log("Listening on port: 9000") 
})