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
                    // DEBUG:try adding, getting tasks...
                    //let id = await this.addTask(["hello world!"])
                    //let task = await this.getTask(id)
                    //console.log('DEBUG::::: task:')
                    //console.log(task)
                    console.log('DEBUG STAGES:::::::: :D');
                    let id = yield this.addTask(["hello world!"]);
                    let task = yield this.getTask(id);
                    console.log("task:");
                    console.log(yield this.getTask(id));
                    yield this.addStage(id, "testing...", true, ["hello world", "bye"], true, "bla bleh bla");
                    console.log("updated:");
                    console.log(yield this.getTask(id));
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
    addDaemon(ip) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            let result = yield this.daemons.insertOne({ 'ip': ip });
            return result.insertedId.toString();
        });
    }
    // to-do: finish this, it's copypaste from gettask atm
    getDaemon(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agent = yield this.daemons.findOne({ _id: new mongodb_1.ObjectId(id) });
                if (agent != null) {
                    return agent;
                }
                return undefined;
            }
            catch (error) {
                console.log('error finding agent with id!');
                console.error(error);
            }
        });
    }
    //to-do: remove cmd since its now a part of stages instead of tasks
    addTask(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // to-do: remove cmd from tasks - move to stages
                let result = yield this.tasks.insertOne({ 'cmd': cmd, 'stages': [], 'artifacts': [] });
                console.log('inserted new task successfully!');
                return result.insertedId.toString();
            }
            catch (error) {
                console.log('error adding task to db!');
                console.error(error);
                return "ERROR";
            }
        });
    }
    getTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const task = yield this.tasks.findOne({ _id: new mongodb_1.ObjectId(id) });
                if (task != null) {
                    return task;
                }
                return undefined;
            }
            catch (error) {
                console.log('error finding task with id!');
                console.error(error);
                return undefined;
            }
        });
    }
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    //to-do: remove cmd since its now a part of stages instead of tasks
    updateTask(id, cmd) {
        try {
            this.tasks.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { 'cmd': cmd, 'stages': [], 'artifacts': [] } });
            console.log("updated task successfully :)");
        }
        catch (error) {
            console.log('error updating task');
            console.error(error);
        }
    }
    getStages(task_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // let testmap:Record<string, any>[]
            // testmap = []
            const task = yield this.tasks.findOne({ _id: new mongodb_1.ObjectId(task_id) });
            if (task != null) {
                return task['stages'];
            }
            return [];
        });
    }
    addStage(task_id, name, data, cmd, timeit, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stages = yield this.getStages(task_id);
                stages.push({ 'name': name, 'data': data, 'cmd': cmd, 'timeit': timeit, 'comment': comment });
                console.log("tasks stages......:");
                console.log(stages);
                yield this.tasks.updateOne({ _id: new mongodb_1.ObjectId(task_id) }, { $set: { 'stages': stages } });
            }
            catch (error) {
                console.log('error adding stage to task');
                console.error(error);
            }
        });
    }
    addResult(daemon, status, timestamp) {
    }
}
exports.dbAdapter = dbAdapter;
