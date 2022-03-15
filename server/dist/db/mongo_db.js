"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbAdapter = exports.collections = void 0;
//import { MongoClient} from "mongodb"
const mongoDB = __importStar(require("mongodb"));
const mongodb_1 = require("mongodb");
//https://www.mongodb.com/compatibility/using-typescript-with-mongodb-tutorial
exports.collections = {};
//DB_CONN_STRING="???"
//DB_NAME="tasksDB"
//TASKS_NAME="tasks"
class dbAdapter {
    constructor() {
        this.SERVER_URL = "mongodb://localhost:27017/test";
        this.DB_NAME = "test";
        this.connect();
    }
    connectToDatabase() {
        //:D
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('connecting to database...');
            try {
                if (!this.client) {
                    this.client = new mongoDB.MongoClient(this.SERVER_URL);
                    yield this.client.connect();
                    this.db = this.client.db(this.DB_NAME);
                    console.log('db client created successfully');
                    this.tasks = this.db.collection("tasks");
                    this.daemons = this.db.collection("daemons");
                    // debug: now try finding the newly added task
                    //this.findTask("622b23e7bec9c63a78067581")
                    //this.DeleteTask("622b28ede0fadc37259f536e")
                    // this.UpdateTask("622b297f01b58c4489a0d7b5", "test!!!!")
                }
            }
            catch (error) {
                console.log('error connecting to mongodb!');
                console.error(error);
            }
            //we need a env file 
            //this.tasks = this.db.collection(process.env.TASKS_NAME)
        });
    }
    addTask(cmd) {
        try {
            this.tasks.insertOne({ 'cmd': cmd });
            console.log('inserted new task successfully!');
        }
        catch (error) {
            console.log('error adding task to db!');
            console.error(error);
        }
    }
    findTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tasks.findOne({ _id: new mongodb_1.ObjectId(id) }, (err, result) => {
                    console.log(":DDD");
                    console.log(result);
                });
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
            catch (error) {
                console.log('error finding task with id!');
                console.error(error);
            }
        });
    }
    DeleteTask(id) {
        try {
            this.tasks.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            const result = this.tasks.deleteOne({ _id: id });
            if (result) {
                console.log("deleted a task");
                console.log(result);
            }
            else {
                console.log("deleting failed");
            }
        }
        catch (error) {
            console.log('wrong id');
            console.error(error);
        }
    }
    UpdateTask(id, command) {
        try {
            this.tasks.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { 'cmd': command } });
            console.log("updated task successfully :)");
        }
        catch (error) {
            console.log('error updating task');
            console.error(error);
        }
    }
    addDaemon(ip) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            let result = yield this.daemons.insertOne({ 'ip': ip });
            return result.insertedId.toString();
        });
    }
    addResult(daemon, status, timestamp) {
    }
}
exports.dbAdapter = dbAdapter;
