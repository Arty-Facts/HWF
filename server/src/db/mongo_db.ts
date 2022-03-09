import { dbInterface } from './db_interface'
//import { MongoClient} from "mongodb"
import * as mongoDB from "mongodb"


import { ObjectId } from 'mongodb'

//https://www.mongodb.com/compatibility/using-typescript-with-mongodb-tutorial

export const collections: {tasks?: mongoDB.Collection} = {}

//DB_CONN_STRING="???"
//DB_NAME="tasksDB"
//TASKS_NAME="tasks"


export class dbAdapter <T extends dbInterface> {
    SERVER_URL : "mongodb://localhost:27017/test"
    DB_NAME : "idk"

    client : mongoDB.MongoClient
    db : mongoDB.Db
    tasks : mongoDB.Collection 
    
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
            }

        } 
        catch(error) { 
            console.log('error connecting to mongodb!');
            console.error(error);
        }
        //we need a env file 
        //this.tasks = this.db.collection(process.env.TASKS_NAME)
        
    }

    addDaemon(id:string, ip:string):void {

    }
    addResult(daemon:string, status:string, timestamp:string): void {
        
    }
}