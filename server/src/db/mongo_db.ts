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

                // DEBUG:try adding, getting tasks...
                let id = await this.addTask(["hello world!"])
                let task = await this.getTask(id)

                console.log('DEBUG::::: task:')
                console.log(task)
            }
            
        } 
        catch(error) { 
            console.log('error connecting to mongodb!');
            console.error(error);
        }
        //we need a env file 
        //this.tasks = this.db.collection(process.env.TASKS_NAME)
        
    }

    async addDaemon(ip:string):Promise<string> {
        let id:string;
        let result = await this.daemons.insertOne({'ip': ip})

        return result.insertedId.toString();
    }

    // to-do: finish this, it's copypaste from gettask atm
    async getDaemon(id:string) {
        try{

            const agent = await this.daemons.findOne({_id: new ObjectId(id)})

            if (agent != null){
                return agent;
            }

            return undefined;
        }
        catch(error) {
            console.log('error finding agent with id!');
            console.error(error);
        }
        
    }

    //to-do: remove cmd since its now a part of stages instead of tasks
    async addTask(cmd:string[]):Promise<string> {
        try {
            let result = await this.tasks.insertOne({'cmd': cmd})

            console.log('inserted new task successfully!')
            return result.insertedId.toString(); 
        }
        catch(error) {
            console.log('error adding task to db!');
            console.error(error);
            return "ERROR";
        }
    }

    async getTask(id:string) {
        try{

            const task = await this.tasks.findOne({_id: new ObjectId(id)})

            if (task != null){
                return task;
            }

            return undefined;
        }
        catch(error) {
            console.log('error finding task with id!');
            console.error(error);

            return undefined;
        }
        
    }

    async deleteTask(id:string) {
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

    //to-do: remove cmd since its now a part of stages instead of tasks
    updateTask(id:string, cmd:string[]) {
        try {
            this.tasks.updateOne({_id: new ObjectId(id)}, {$set: {'cmd': cmd, 'stages': [], 'artifacts': []}})
            console.log("updated task successfully :)")
        } 
        catch(error:any) {
            console.log('error updating task')
            console.error(error)
        }

    }

    async getStages(task_id:string): Promise<[]>{

        return []
    }

    async addStage(task_id:string, name:string, data:boolean, cmd:string[], timeit:boolean, comment:string): Promise<void> {
        try {

            let stages = await this.getStages(task_id);
            
            stages.push({'name': name, 'data': data, 'cmd': cmd, 'timeit': timeit, 'comment': comment});
            this.tasks.updateOne({_id: new ObjectId(task_id)}, {$set: {'stages': stages}});
        }
        catch(error:any){
            console.log('error adding stage to task')
            console.error(error)
        }
    }

    addResult(daemon:string, status:string, timestamp:string): void {
        
    }
}