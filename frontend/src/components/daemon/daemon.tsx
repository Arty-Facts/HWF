import "./daemon.css"
export default function Daemon(daemon:any){
    if (!daemon){
        return (
            <h2>No demons found</h2>
        )
    }
    else if (daemon.daemon.connected){
        return (
        
            <ul className = "daemon">
                <li><b>ip:</b> {daemon.daemon.ip}</li>
                <li><b>connected:</b> {daemon.daemon.connected.toString()}</li>
                <li><b>idle:</b> {daemon.daemon.idle.toString()}</li>
                <li><b>--specs--</b></li>
                <li><b>os: </b>{daemon.daemon.specs.os}</li>
                <li><b>cpu: </b>{daemon.daemon.specs.cpu}</li>
                <li><b>gpu: </b>{daemon.daemon.specs.gpu}</li>
                <li><b>ram: </b>{daemon.daemon.specs.ram}</li>
            </ul>)
    }
    else {
        return (
        
            <ul className = "daemon_inactive">
                <li><b>ip:</b> {daemon.daemon.ip}</li>
                <li><b>connected:</b> {daemon.daemon.connected.toString()}</li>
                <li><b>idle:</b> {daemon.daemon.idle.toString()}</li>
                <li><b>--specs--</b></li>
                <li><b>os: </b>{daemon.daemon.specs.os}</li>
                <li><b>cpu: </b>{daemon.daemon.specs.cpu}</li>
                <li><b>gpu: </b>{daemon.daemon.specs.gpu}</li>
                <li><b>ram: </b>{daemon.daemon.specs.ram}</li>
            </ul>)
    }
    
}