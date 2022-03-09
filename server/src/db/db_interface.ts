export interface dbInterface {
    // to-do: add more info to db
    connectToDatabase:() => void;
    addDaemon:(id:string, ip:string) => void;
    addResult:(daemon:string, status:string, timestamp:string) => void;
    // addSpecs: (os:string, gpu:string, cpu:string, ram:string) => void;
    // addMsg: (message:string) => void;
    
}