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
                    yield this.addStage(id, "yay", ["hello world", "bye"], "comment", true, true, false, false);
                    yield this.addStage(id, "weeo", ["hello world", "bye"], "comment", true, true, false, false);
                    console.log("updated:");
                    console.log(yield this.getTask(id));
                    //console.log("updated:")
                    //console.log(await this.getTask(id))
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
    //to-do: add specs + other fields?
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
                const result = this.tasks.deleteOne({ _id: new mongodb_1.ObjectId(id) });
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
    /*
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
    */
    updateStage(task_id, stage_name, stage_status, ram, cpu, gpu) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                status: string
                ram_usage: -
                cpu_usage: -
                gpu_usage
                */
                var set_dict = {};
                if (typeof stage_status !== 'undefined') {
                    set_dict['stages.$.status'] = stage_status;
                }
                if (typeof ram !== 'undefined') {
                    set_dict['stages.$.ram_usage'] = ram;
                }
                if (typeof cpu !== 'undefined') {
                    set_dict['stages.$.cpu_usage'] = cpu;
                }
                if (typeof gpu !== 'undefined') {
                    set_dict['stages.$.gpu_usage'] = gpu;
                }
                //this.tasks.updateOne({_id: new ObjectId(task_id), 'stages.name': stage_name}, {$set: {'stages.$.status': stage_status}})
                this.tasks.updateOne({ _id: new mongodb_1.ObjectId(task_id), 'stages.name': stage_name }, { $set: set_dict });
                console.log("updated task successfully :)");
            }
            catch (error) {
                console.log('error updating task');
                console.error(error);
            }
        });
    }
    /*
    async getStages(task_id:string): Promise<Record<string,any>[]>{

        // let testmap:Record<string, any>[]
        // testmap = []

        const task = await this.tasks.findOne({_id: new ObjectId(task_id)})
        if (task != null){
            return task['stages']
        }

        return []
    }*/
    addStage(task_id, name, cmd, comment, track_time, track_ram, track_cpu, track_gpu) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //const stages = await this.getStages(task_id);
                // to-do: get actual time
                let time = '2022/4/20-13:37';
                //stages.push({'name': name, 'cmd': cmd, 'comment': comment, 'status': 'queued', 
                //'track_time': track_time, 'track_ram': track_ram, 'track_cpu': track_cpu, 'track_gpu': track_gpu, 
                //'time_started': time, 'time_finished': 'N/A', 'ram_usage': 'N/A', 'cpu_usage': 'N/A', 'gpu_usage': 'N/A'});
                let stage = { 'name': name, 'cmd': cmd, 'comment': comment, 'status': 'queued',
                    'track_time': track_time, 'track_ram': track_ram, 'track_cpu': track_cpu, 'track_gpu': track_gpu,
                    'time_started': time, 'time_finished': 'N/A', 'ram_usage': 'N/A', 'cpu_usage': 'N/A', 'gpu_usage': 'N/A' };
                //console.log("tasks stages......:")
                //console.log(stages)
                yield this.tasks.updateOne({ _id: new mongodb_1.ObjectId(task_id) }, { $push: { 'stages': stage } });
            }
            catch (error) {
                console.log('error adding stage to task');
                console.error(error);
            }
        });
    }
    deleteStage(task_id, stage_name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tasks.updateOne({ _id: new mongodb_1.ObjectId(task_id), 'stages.name': stage_name }, { $pull: { 'stages': { 'name': stage_name } } });
        });
    }
    addResult(daemon, status, timestamp) {
    }
}
exports.dbAdapter = dbAdapter;
