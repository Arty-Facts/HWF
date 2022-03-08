import { dbInterface } from './db_interface'
//import { MongoClient} from "mongodb"
import * as mongoDB from "mongodb"

//https://www.mongodb.com/compatibility/using-typescript-with-mongodb-tutorial


export class dbAdapter <T extends dbInterface> {

    client : mongoDB.Db

    connectToDatabase():void {
        //:D
    }

    addDaemon(id:string, ip:string):void {

    }
    addResult(daemon:string, status:string, timestamp:string): void {
        
    }
}