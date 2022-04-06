export interface dbInterface {
    // to-do: add more info to db
    connectToDatabase:() => void;

    addDaemon:(ip:string) => string;
    getDaemon:(id:string) => string;
    updateDaemon:(id:string) => void;

    // addSpecs: (os:string, gpu:string, cpu:string, ram:string) => void;
    // addMsg: (message:string) => void;

    addTask:(cmd:string[]) => string;
    getTask:(id:string) => string;
    updateTask:(id:string, cmd:string[]) => void;
    deleteTask:(id:string) => void;

    getStages:(task_id:string) => [];
    addStage:(task_id:string, name:string, data:boolean, cmd:string[], timeit:boolean, comment:string) => void;

    addResult:(daemon:string, status:string, timestamp:string) => void;
    
    
}