import { createServer, IncomingMessage } from "http"
import * as  ws from 'ws'
import {WebSocket} from 'ws'
import {Request, response, Response,} from 'express'
import express from 'express'
import { dbAdapter } from "./db/mongo_db"
import cors from "cors"

import { FlatbufferHelper, Task, GetResult, Hardware} from "./flatbufferHelper"
import { removeAllListeners } from "process"
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
    //According to what i've read ws doesn't propely close a socket if it's disconnected improperly (such as a network cable getting unplugged). We should test this (and solve it if necessary)
    //Should something be logged to a file? That being things that aren't saved in the DB, such as connects/disconnects.
    //Maybe add timestamps to log messages? ("[2022-03-13, 16:33:24] Error: bla bla bla")

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
    isIdle:boolean;  
    isConnected:boolean;

    currentTask:string | null;
    taskStartTime:string | Date;

    constructor(ws:WebSocket) {
        this.socket = ws
        this.isIdle = true
    }

    send(data:Uint8Array, responseSocket: WebSocket, id?:string) {
        this.socket.send(data) 
        this.isIdle = false 

        if (id){
        this.currentTask = id
        responseSocket.send(`424 ${id}`)
    }
    }
}

class Queue {

    contents:[Uint8Array, WebSocket, string][] = []

    enqueue(data: Uint8Array, socket:WebSocket, id:string): void {

        this.contents.push([data, socket, id])
    }

    dequeue(target: [Uint8Array, WebSocket, string] ): void {
    
        this.contents.forEach(tuple => {

            if (tuple == target) {
                this.contents.splice(this.contents.indexOf(tuple), 1)
                return    
            }
        }); 
        //TODO: FIX THIS 
            console.log("[Hub]: Could not find tuple to be removed in the queue") 
    }
        
    size(): number {
        return this.contents.length
    }
}

class LoadBalancer {

    queue:Queue
    priorityType: string

    queueTask(task:Uint8Array, socket:WebSocket, id:string): void {
        this.queue.enqueue(task, socket, id)
    }

    retryQueuedTasks(){
        if (this.queue.contents.length == 0) {return}
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
                if (agent != undefined && agent != null && agent.isIdle ) {
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

var agents:Agent[] = []
var balancer = new LoadBalancer("fifo")
balancer.queue = new Queue()
let currentDate = new Date()

async function createAgent(socket:WebSocket, ip:string, req:IncomingMessage): Promise<Agent> {

    let agent = new Agent(socket)
    agents.push(agent)
    agent.ip = ip
    agent.specs = {"os": "unknown", "cpu": "unknown", "gpu": "unknown", "ram": "unknown"}
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
    let task = message.messageBody as Task
    console.log("\n[Hub]: Finding agent for task.")
    for (let agent of agents) {
        if ( //TODO: Make this less hardcoded, loop through both instead?
                (agent.specs.os == task.hardware["os"] || task.hardware["os"] == "any" ) &&
                (agent.specs.cpu == task.hardware["cpu"] || task.hardware["cpu"] == "any" )  &&
                (agent.specs.gpu == task.hardware["gpu"] || task.hardware["gpu"] == "any" ) &&
                (agent.specs.ram == task.hardware["ram"] || task.hardware["ram"] == "any" )
            ) 
            {
                return agent
            }
    };
    return null
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





wss.on('connection', async (ws:WebSocket, req:IncomingMessage) => {
    var agent:Agent
    let ip = req.socket.remoteAddress
    
    if (ip == undefined) {
        throw new Error("Could not read ip of connecting agent, was undefined")
    }

    console.log(`\n[Hub]: New Daemon connected with ip: [${ip}].`)
    
    let lookupResult:boolean|Agent = doesAgentExist(ip)
    if (!lookupResult) {
        console.log("[Hub]: IP not recognized, creating new agent.")
        agent = await createAgent(ws, ip, req!)
    }
    else{
        console.log("[Hub]: IP recognized, retrieving saved agent.")
        agent = lookupResult as Agent
        agent.isIdle = true

        if (agent.socket != ws) {
            agent.socket = ws
        }
    }

    agent.isConnected = true
    balancer.retryQueuedTasks()
    
    
    ws.on("message", async (binaryMessage:Uint8Array ) => { 
        // We currently assume that we will always get a flatbuffer Result here, if that changes add a switch on "fbHelper.getFlatbufferType(binaryMessage)""
        let message = fbHelper.readFlatbufferBinary(binaryMessage)
        
        switch (fbHelper.getFlatbufferType(binaryMessage)){
            case 5: {
                console.log(`\n[Hub]: Received Result from agent [${agent.ip}].`)
                agent.isIdle = true
                
        
                let task_id = agent.currentTask!
                let id = await db.addResult(task_id, JSON.stringify(message.messageBody))
                balancer.retryQueuedTasks()
                break
            }

            case 6: {
                let hw = (message.messageBody as Hardware)
                agent.specs["os"]  = hw.os
                agent.specs["cpu"] = hw.cpu
                agent.specs["gpu"] = hw.gpu
                agent.specs["ram"] = hw.ram

                console.log(`[Hub]: Received specs from daemon\n       OS:  [${agent.specs.os}]\n       CPU: [${agent.specs.cpu}]\n       GPU: [${agent.specs.gpu}]\n       RAM: [${agent.specs.ram}]`)

                balancer.retryQueuedTasks()
                break
            }

        }

    })
    
    ws.on('close', () => {
        console.log(`[Hub]: Agent with IP [${agent.ip}] disconnected`)
        agent.isConnected = false
    })
})

userWss.on("connection", (ws:WebSocket, req:IncomingMessage) => {
    var targetAgent:Agent
    ws.on("message", async (binaryMessage:Uint8Array) => {
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
                //console.log(readableMessage)
                let agent = findAgentForTask(readableMessage)
                
                if (agent == null) {


                    console.log("[Hub]: No agent matched the requirements of the task.")
                    ws.send("404")
                }

                else if (!agent.isConnected) {
                    targetAgent = agent!
                    console.log("[Hub]: Matching non-connected agent found. Adding task to queue.")
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    balancer.queue.enqueue(binaryMessage, ws, id)
                    ws.send(`242 ${id}`)
                }

                else if (agent.isIdle) {
                    targetAgent = agent!
                    console.log("[Hub]: Agent found for task, sending data.")
                    agent.send(binaryMessage, ws)
                    agent.taskStartTime = currentDate

                    agent.isIdle = false
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    ws.send(`200 ${id}`)

                    // save the task as agent's current task
                    agent.currentTask = id
                    
                }

                else {
                    targetAgent = agent!
                    console.log("[Hub]: Busy agent found. Adding task to queue")
                    let id = await db.addTask(JSON.stringify(readableMessage.messageBody))
                    balancer.queue.enqueue(binaryMessage, ws, id)
                    ws.send(`242 ${id}`)
                }
                break
            }
            case 2: {
                console.log(`\n[Hub]: Results requested from client [${req.socket.remoteAddress}]`)
                let readableMessage = fbHelper.readFlatbufferBinary(binaryMessage)
            
                let results:string[] = []
                for ( let id of (readableMessage.messageBody as GetResult).id_list){
                    try {
                        //console.log("get result hämta från db")
                        let tempResult = await db.getResult(id)
                        if (tempResult != undefined)
                        {
                            results.push(tempResult)
                        }
                    }
                    catch (e) {
                        console.log(`get result error [${e}]`)
                    }
                }
                /*
                if (results == undefined || results.includes(undefined)){
                    console.log("Error: Trying to serialize something undefined")
                    ws.send("500 The results retrieved from the database was undefined")
                    return
                }
                */
                //console.log(results)
                console.log(`[Hub]: Retrieving results from Database.`)
                results.forEach(element => {
                    console.log(element) 

                    // element is actually a cursed JSON object saved in string[], use like this:
                    //let obj = JSON.parse(JSON.stringify(element))
                    //console.log(obj["_id"])  
    
                });
                var serializedResults = fbHelper.buildFlatbufferResultList(results)
                
                
                ws.send(serializedResults)
                console.log(`[Hub]: Results sent to client [${req.socket.remoteAddress}].`)
                //Build a flatbuffer thingy for each result, we get a json object from the db
                //Send each result back to the pythonapi
                break
            }
            case 3: {
                console.log(`\n[Hub]: Hardware info requested by client [${req.socket.remoteAddress}].`)
                let hardware:{"os":string, "gpu": string, "cpu": string, "ram": string}[] = []
                agents.forEach( (agent) => {
                    hardware.push(
                        {
                            "os": agent.specs.os!, 
                            "gpu": agent.specs.gpu!, 
                            "cpu": agent.specs.cpu!, 
                            "ram": agent.specs.ram!
                        }
                    )
                })

                let serializedHardware = fbHelper.buildFlatbufferHardwareList(hardware)
                ws.send(serializedHardware)
                console.log(`[Hub]: Hardware info sent to client [${req.socket.remoteAddress}].`)
                break
            }
            case 4: {

                // to-do: send this to the correct agent!!!!!
                targetAgent.send(binaryMessage, ws)
                break
            }
        } 
    })
})

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
        
        let stageNames:string[] = [];
        ((fbMessage.messageBody as Task).stages).forEach(element => {
            stageNames.push(element.name!)
        });

        result.push({
            "target_hardware": (fbMessage.messageBody as Task).hardware,
            "stagenames": stageNames,
            "artifacts": (fbMessage.messageBody as Task).artifacts
        });

        
    }

    return res.json(result)
})

userServer.listen(3001, () => {
    console.log("[Hub]: Listening for Clients on port: 3001")
})

server.listen(9000, () => {
    console.log("[Hub]: Listening for Agents on port: 9000") 
})