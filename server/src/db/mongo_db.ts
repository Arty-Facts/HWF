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
    daemons : mongoDB.Collection

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
                this.tasks = this.db.collection("tasks")
                this.daemons = this.db.collection("daemons")

                // debug: now try finding the newly added task
                //this.findTask("622b23e7bec9c63a78067581")


                //this.DeleteTask("622b28ede0fadc37259f536e")

                // this.UpdateTask("622b297f01b58c4489a0d7b5", "test!!!!")
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

            // const result = await this.tasks.findOne({_id: id})

            // if (result)
            // {
            //     console.log("found task with message:")
            //     console.log(result)
            // }
            // else {
            //     console.log("couldn't find anything pepehands")
            // }
        }
        catch(error) {
            console.log('error finding task with id!');
            console.error(error);
        }
        
    }

    DeleteTask(id:string) {
        try {

            this.tasks.deleteOne({_id: new ObjectId(id)})
            const result = this.tasks.deleteOne({_id: id})

            if (result)
            {
                console.log("deleted a task")
                console.log(result)
            }
            else {
                console.log("deleting failed")
            }
        }
        catch(error){
            console.log('wrong id')
            console.error(error);
        }

    }

    UpdateTask(id:string, command:string) {
        try {
            this.tasks.updateOne({_id: new ObjectId(id)}, {$set: {'cmd': command}})
            console.log("updated task successfully :)")
        } 
        catch(error:any) {
            console.log('error updating task')
            console.error(error)
        }

    }

    async addDaemon(ip:string):Promise<string> {
        let id:string;
        let result = await this.daemons.insertOne({'ip': ip})

        return result.insertedId.toString();
    }

    addResult(daemon:string, status:string, timestamp:string): void {
        
    }
}