import "./home.css";
import Topbar from "../../components/topbar/topbar"
import Daemon from "../../components/daemon/daemon";
import Task from "../../components/task/task";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  
  var serverUrl = "http://localhost:3001"
  // if (process.env.REACT_APP_HWF_SERVER_URL){
  // var serverUrl:string = process.env.REACT_APP_HWF_SERVER_URL;}
  // else {throw "Can't read HWF_SERVER_URL environment variable. Is it empty?"}
  
  const [daemonList, setDaemonList] = useState([])
  const [taskList, setTaskList] = useState([]);
  /* uses setInterval/clearInterval to poll the database for updates about the currently connected daemons */
  useEffect(()=>{
    const timer = setInterval(async ()=>{
      try {
        
          const taskList = await axios.get(serverUrl + `/queuedtasks`); 
          setTaskList(taskList.data); //axios automatically parses json data so we don't have to handle it manually
      } catch (err) {
        console.log(err);
        setTaskList([])
      }

      try {
        const response = await axios.get(serverUrl + "/daemons")
        setDaemonList(response.data);
      }
      catch (err) {
        console.log(err)
      }
    },5000); //set time interval in ms
    return ()=>{
      clearInterval(timer);
    }
  },[]);
  console.log(daemonList)
  return (
    <>
      <Topbar/>
      
      <h1>Connected Daemons</h1>
      <div className="daemons">
          {daemonList.map((daemon, i) => {
          return <Daemon daemon={daemon} key={i}/>; //the keys shouldn't really be based on the index, but i was lazy so i did it anyway
          })}
      </div>
      <h1>Queued Tasks</h1>
      <div className="tasks">
        {taskList.map((task, i) => {
          return <Task task={task} key={i}/>;
          })}
      </div>
    </>
  );
}



/*
General structure of our json objects
[
  {
    "id": 1,
    "name": "testname1",
    "specs": {
        "os": "windows10",
        "gpu": "5700xt",
        "cpu": "r5_3600",
        "ram": "16gb"
    }
  },
  {
    "id": 2,
    "name": "testname2",
    "specs": {
        "os": "windows10",
        "gpu": "5700xt",
        "cpu": "r5_3600",
        "ram": "16gb"
    }
  }
]
*/