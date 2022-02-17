//Testklient för server.js
import ws from "ws"

const client = new ws('ws://localhost:3000?os=windows10&gpu=5700xt&cpu=r5_3600&ram=16gb')

client.on("open", () => {
    client.send("Jag är en agent")
})

client.on("message", (message: string) => {
    console.log(`Recieved: ${message}`)
})