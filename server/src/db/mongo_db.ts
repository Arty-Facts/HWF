import { dbInterface } from './db_interface'
//import { MongoClient} from "mongodb"
import * as mongoDB from "mongodb"
import { ObjectId } from "mongodb"

//https://www.mongodb.com/compatibility/using-typescript-with-mongodb-tutorial

export const collections: {tasks?: mongoDB.Collection} = {}

//DB_CONN_STRING="???"
//DB_NAME="tasksDB"
//TASKS_NAME="tasks"


export class dbAdapter <T extends dbInterface> {
    SERVER_URL : string
    DB_NAME : string

    client : mongoDB.MongoClient
    db : mongoDB.Db
    tasks : mongoDB.Collection 

    constructor() {
        this.SERVER_URL = "mongodb://localhost:27017/test"
        this.DB_NAME = "test"

        this.connect()
    }
    
    connectToDatabase():void {
        //:D
        this.connect()
    }
    
    async connect() {
        console.log('connecting to database...');

        try {
            if (!this.client) {
                this.client = new mongoDB.MongoClient(this.SERVER_URL);
                await this.client.connect();
                this.db = this.client.db(this.DB_NAME);

                console.log('db client created successfully');
                this.tasks = this.db.collection("helloworld")

                // debug: now try adding new task
                this.addTask("hello world!")

                // debug: now try finding the newly added task
                this.findTask("622b23e7bec9c63a78067581")
            }

        } 
        catch(error) { 
            console.log('error connecting to mongodb!');
            console.error(error);
        }
        //we need a env file 
        //this.tasks = this.db.collection(process.env.TASKS_NAME)
        
    }

    addTask(cmd:string):void {
        try {
            this.tasks.insertOne({'cmd': cmd})
            console.log('inserted new task successfully!')
        }
        catch(error) {
            console.log('error adding task to db!');
            console.error(error);
        }
    }

    async findTask(id:string) {
        try{
            

            this.tasks.findOne({_id: new ObjectId(id)}, (err, result) => {
                console.log(":DDD")
                console.log(result)
            })

            const result = await this.tasks.findOne({_id: id})

            if (result)
            {
                console.log("found task with message:")
                console.log(result)
            }
            else {
                console.log("couldn't find anything pepehands")
            }
        }
        catch(error) {
            console.log('error finding task with id!');
            console.error(error);
        }
        
    }

    updateTask(id:string) {
        

    }

    DeleteTask(id:string) {
        

    }

    

    addDaemon(id:string, ip:string):void {

    }
    addResult(daemon:string, status:string, timestamp:string): void {
        
    }
}