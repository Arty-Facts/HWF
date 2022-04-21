import "./home.css";
import Topbar from "../../components/topbar/topbar"

import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  
  if (process.env.HWF_SERVER_URL){
  var serverUrl:string = process.env.HWF_SERVER_URL;}
  else {throw "Can't read HWF_SERVER_URL environment variable. Is it empty?"}
  
  const [specs, setSpecs] = useState([]);
  /* uses setInterval/clearInterval to poll the database for updates about the currently connected daemons */
  useEffect(()=>{
    const timer = setInterval(async ()=>{
      try {
        if(specs !== null){
            const specList = await axios.get(serverUrl + `/specs`); 
            console.log(specList.data);
            setSpecs(specList.data); //axios automatically parses json data so we don't have to handle it manually
        } else {
            console.log("Shits fucked yo!")
        }
      } catch (err) {
        console.log(err);
      }
    },5000); //set time interval in ms
    return ()=>{
      clearInterval(timer);
    }
  },[]);


  return (
    <>
      <Topbar/>
      <div className="home">
        <ul>
          {specs.map( (spec)=> {return <h1>{`daemon [${spec["id"]}]: Name: [${spec["name"]}] Specs: [${spec["specs"]["os"]}, ${spec["specs"]["gpu"]}, ${spec["specs"]["ram"]}]`}</h1>} )}
        </ul>
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