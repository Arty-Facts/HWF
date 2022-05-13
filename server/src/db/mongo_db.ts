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
    results : mongoDB.Collection 

    constructor() {

        if(process.env.HWF_DB_URL){
            console.log("env variable is " + process.env.HWF_DB_URL)
            this.SERVER_URL = process.env.HWF_DB_URL }//"mongodb://database:27017/test"
        else{
            //throw "HWF_DB_URL environment variable can't be read!"
            this.SERVER_URL = "mongodb://localhost:27017/test"
        }
        this.DB_NAME = "test"

        this.connect()
    }
    
    async connect() {
        //console.log('connecting to database...');

        try {
            if (!this.client) {
                this.client = new mongoDB.MongoClient(this.SERVER_URL);
                await this.client.connect();
                this.db = this.client.db(this.DB_NAME);

                //console.log('db client created successfully');
                this.tasks = this.db.collection("tasks")
                this.daemons = this.db.collection("daemons")
                this.results = this.db.collection("results")

                console.log(`Connected to Database at: ${this.SERVER_URL}`)
                // debug: now try finding the newly added task
                //this.findTask("622b23e7bec9c63a78067581")


                //this.DeleteTask("622b28ede0fadc37259f536e")

                // this.UpdateTask("622b297f01b58c4489a0d7b5", "test!!!!")

                // DEBUG:try adding, getting tasks...
                //let id = await this.addTask(["hello world!"])
                //let task = await this.getTask(id)

                //console.log('DEBUG::::: task:')
                //console.log(task)

                //console.log('DEBUG STAGES:::::::: :D')
                // let id = await this.addTask(["hello world!"])
                // let task = await this.getTask(id)
                //console.log("task:")
                //console.log(await this.getTask(id))
                    /*
                await this.addStage(id, "testing...", ["hello world", "bye"], "comment",true, true, false,false)
                await this.addStage(id, "testing2...", ["hello world", "bye"], "comment",true, true, false,false)
                await this.addStage(id, "testing3...", ["hello world", "bye"], "comment",true, true, false,false)
                await this.addStage(id, "testing4...", ["hello world", "bye"], "comment",true, true, false,false)

                await this.updateStage(id, "testing...", "very GOOD")
                await this.updateStage(id, "testing2...", "very GOOD", "test", "wahoo", "wee")
                await this.updateStage(id, "testing3...", "very GOOD", "bla")
                await this.updateStage(id, "testing4...", "very GOOD", "peep", undefined, "bloop")
                */

                //await this.updateStage("625533e6244171f5f8cc504a", "testing4...", "very GOOD", undefined, undefined, "WAHAHAHAH")
                
                // await this.addStage(id, "yay", ["hello world", "bye"], "comment",true, true, false,false)
                // await this.addStage(id, "weeo", ["hello world", "bye"], "comment",true, true, false,false)

                //console.log("updated:")
                //console.log(await this.getTask(id))

                //console.log("updated:")
                //console.log(await this.getTask(id))



                
            }
            
        } 
        catch(error) { 
            console.log('error connecting to mongodb!');
            console.error(error);
        }
        //we need a env file 
        //this.tasks = this.db.collection(process.env.TASKS_NAME)
        
    }

    //to-do: add specs + other fields?
    async addDaemon(agent:string):Promise<string> {
        let result = await this.daemons.insertOne(JSON.parse(agent))
        console.log(`Inserted new Daemon successfully with ID[${result.insertedId.toString()}]`)
        //console.log(await this.getTask(result.insertedId.toString()))
        return result.insertedId.toString();
    }

    async getDaemon(id:string) {
        try{

            const agent = await this.daemons.findOne({_id: new ObjectId(id)})
            return agent != null? agent : undefined;
        }
        catch(error) {
            console.log('error finding agent with id!');
            console.error(error);
        }
        
    }

    async addTask(task:string):Promise<string> {
        try {
            let result = await this.tasks.insertOne(JSON.parse(task))
            
            console.log(`Inserted new Task successfully with ID[${result.insertedId.toString()}]`)
            console.log(await this.getTask(result.insertedId.toString()))
            
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
            return task != null? JSON.parse(JSON.stringify(task)) : undefined
        }
        catch(error) {
            console.log('error finding task with id!');
            console.error(error);

            return undefined;
        }
        
    }

    async deleteTask(id:string) {
        try {

            const result = this.tasks.deleteOne({_id: new ObjectId(id)})

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

    async addResult(task_id: string, res:string) {
        try {
            let temp = JSON.parse(res)
            temp["_id"]=new ObjectId(task_id)
            let result = await this.results.insertOne(temp)
            console.log(`Inserted new Result successfully with ID[${result.insertedId.toString()}]`)
            let bla = await this.getResult(result.insertedId.toString())
            console.log(bla)
            console.log(bla.stageResults[0])
            console.log(bla.stageResults[0].cmd[0])
            
            return result.insertedId.toString(); 
        }
        catch(error)
        {
            console.log('error adding Result to db!');
            console.error(error);
            return "ERROR";
        }
    }

    async getResult(id:string) {
        try {
            console.log("i getResult")
            console.log(id)
            console.log(new ObjectId(id))
            const result = await this.results.findOne({_id: new ObjectId(id)})
            
            console.log(result)
            console.log(JSON.parse(JSON.stringify(result)))
            return result != null? JSON.parse(JSON.stringify(result)) : undefined
        }
        catch(error)
        {
            console.log('error finding Result with id!');
            console.log(id)
            console.error(error);

            return undefined;
        }
    }
}