const express = require("express")
const app = express()
const server = require('http').createServer(app)
const WebSocket = require("ws")
const wss = new WebSocket.Server({ server:server });
const url = require("url");


app.use(express.json())

// TODO: Implementera cors? Behövs det?
// app.use(cors({
//     origin:"*",
//     methods: ["GET", "POST", "PUT", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "*"]
// }))

//TODO: Kolla upp hur man gör "asynchronously" så att man kan ta emot flera sockets
// req is a httpincomingmessage -> https://www.w3schools.com/nodejs/obj_http_incomingmessage.asp

//TODOs & Nils funderingar: 
    //Bättre id-system
    //Hur skiljer vi på agent(demon)klienter och användarklienter? Behövs det?  
    //Ska agenter få namnge sig själva vid anslutning? Demonen kan t.ex plocka datorns namn och skicka med det (typ "Kalles ubuntu-testdator").
    //Man borde kanske spara info om agenter även om de frånkopplas? Så kan man t.ex reservera ett ID för en agent ifall den tillfälligt tappar anslutningen.
    //ws stänger (enligt vad jag har läst) inte en socket om klienten frånkopplas på fel sätt, t.ex om en kabel dras ut. Hur löser vi ett sånt problem?
    //ska en användare kunna avbryta en agents körning av ett program (eller kanske sätta en tidsgräns för programmet)? T.ex om ett program fastnar i en loop.
    //Ska något loggas till fil? Sånt som inte redan ska läggas i databasen alltså, t.ex fel, allmänna loggmeddelanden och sånt 
    //Ska loggmeddelanden skriva ut dåvarande tid också eller är det onödigt? ("Error: bla bla bla" vs "[2022-03-13, 16:33:24] Error: bla bla bla")
    //Måste användare autentisera sig för att få använda agenterna? Hur?
    //Ska servern veta vem som startade ett uppdrag (och ev. spara det i databasen senare)?
    //
    //Idé: Skicka en notis när ett uppdrag är färdigt/avbrutet/misslyckat. Inte relevant nu med tanke på att det lär göras via webbsidan
    
    var idnum = 1

wss.on('connection', (ws, req) =>{
    
    
    //Sätter id och namn på en socket
    ws.id = idnum
    ws.name = "testname" + idnum 
    idnum++

    //socket.remoteAddress ger klientens IP-address
    console.log(`New client "${ws.name}" connected from ${req.socket.remoteAddress}. Given id ${ws.id} `)
    
    ws.send("You have connected to the server!")
    

    //Sparar de specs som skickas med i URL, TODO: borde ha någon felhantering för t.ex tomma/saknde fält
    queries = url.parse(req.url, true).query
    ws.specs = {"os": queries["os"], "gpu": queries["gpu"], "cpu": queries["cpu"], "ram": queries["ram"],}
    console.log("Agent specs:")
    console.log(ws.specs)
    
    ws.on("message", (message) => {
        console.log(`Recieved message from ${ws.name}: "${message}"`)
        ws.send("The server recieved your message")
    })

    ws.on('close', () => {
        console.log(`Client "${ws.name}" (id ${ws.id}) disconnected`)
        
    })
})

//Hämtar agent med visst ID från wss.client. Baserat på ID:t som gavs ut vid anslutning
function getAgent(agentId){
    let matchedAgent = null
    wss.clients.forEach(client => {
        if (client.id == agentId) {
            matchedAgent = client
            return
        }
    });

    if (matchedAgent != null) {return matchedAgent}

    console.error(`Could not get agent. Agent with id ${agentId} does not exist`)
    return null
}

//TODO: Serialisera data med vald metod
function sendToAgent(data, agentId) {

    let agent = getAgent(agentId)

    if (agent != null) {

        try {
            agent.send(data)
            console.log(`Data sent to agent ${agentId}`)
            return 200
        }
        catch (err) {
            console.error("Could not send data to agent")
            console.error(err)
            return 500
        }
    }
    else if (agent == null){
        return 404
    }
    else {
        console.error("You should not be here")
        return 500
    }

}

//Hämtar specs för alla anslutna agenter
app.get('/specs', (req, res) => {

    console.log("retrieving agents specs")

    if (wss.clients.size == 0) {    
        console.log("No agents found")
        return res.sendStatus(404)
    }

    let result = {"agents": [],}
    wss.clients.forEach( (client) => {
        result.agents.push({
            "id": client.id, 
            "name": client.name, 
            specs:[{
                "os": client.specs.os, 
                "gpu": client.specs.gpu, 
                "cpu": client.specs.cpu, 
                "ram": client.specs.ram
            }]
        })
    })

    return res.json(result)   

})

//Skickar data till en agent med matchande ID
//TODO: Felkontroll (ogiltligt id, ingen data, etc)
app.post('/sendToAgent', (req,res) => {

    //Detta känns som en lite ful lösning för att få statuskoder, men det funkar
    res.sendStatus(sendToAgent(req.body["data"], req.body["id"]))
    
})

app.post('/createNewJob', (req, res) => {
    let newMessage = req.body.message //string
    let newHardwareParameters = req.body.hardwareParameters //array
    
    //call function to find appropriate client -> return correct websocket
    //ws.send send message to client
    //wait for response
    //spara data i databasen
    //res.status(200).json({status: true, time: siffra })
})

app.get('/', (req,res) => res.send("bla"))

server.listen(3000, (err) => {
    if(err) console.log(err)
    console.log("Listening on port: 3000") 
})


//TODO:
//Användare ska kunna skicka ett "jobb"
/*
    - servern tar emot request på godtycklig endpoint, dvs ngn "/någonting" 
    - kolla vilken av de uppkopplade klienterna som passar requestens parametrar
    - Om ingen passar svara användaren
*/

//klient ska kunna koppla upp sig mot servern 
/*
    - Server ska lyssna på port 3000 och ta emot inkommande WS kopplingar
    - Spara info om koppling på något godtyckligt ställe
*/

//server ska kunna skicka job ifrån användare till klient
/*
    - Om användarrequest matcher en klients specifikationer skicka till klient
    
 */

//man ska kunna spara data i en databas
/*
    - vid svar från klient logga datan i en databas 
*/

//Man ska kunna hämta data ifrån en databas
/* 
    - frontenden ska kunna requesta sin användares data ifrån serverns databas
*/

