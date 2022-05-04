import "./task.css"

export default function Task(task:any){
    console.log("TASK IS:")
    console.log(task)
    if (task == undefined) {
        return (
            <h2>No task found</h2>
        )
    }
    else {
        return (
            <ul className = "task">
                <li><b>---Stages---</b></li>
                <li><b>not shown yet</b></li>
                <li><b>---Target Hardware---</b></li>
                <li><b>os: </b>{task.task.target_hardware.os}</li>
                <li><b>cpu: </b>{task.task.target_hardware.cpu}</li>
                <li><b>gpu: </b>{task.task.target_hardware.gpu}</li>
                <li><b>ram: </b>{task.task.target_hardware.ram}</li>
                <li><b>---Artifacts---</b></li>
                <li><b>{task.task.artifacts.files}</b></li>
            </ul>
        )
    }
}