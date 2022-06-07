from time import sleep
import HWF
import asyncio

async def main():
    donutTask = HWF.Task(
        HWF.Stage(
            name="DonutTask",
            cmd=["touch placeholder.txt", "sudo apt-get install python3 -y", "sudo apt install python3-pip -y", "yes | pip install pygame", "python3 ./donut.py"],
            data = [HWF.Data("donut.py", "donut.py")],
            track_time=True,
            track_ram=False,
            track_cpu=False,
            track_gpu=False,
            comment="This task is very delicious"
        ),
        HWF.Artifacts("placeholder.txt"),
        hardware = {"os": "any", "gpu": "any", "cpu": "any", "ram": "any"}
    )


    idList = []

    hub = HWF.Hub(ip_address="ws://localhost:3001")
    
    await hub.connect()
    idList.append(await hub.dispatch(task=donutTask))
    print(f"[donutTask.py]: Donut task ID [{idList}]")
    results = await hub.get_result(idList)
    for task in results:
        if task.artifacts:
            print(f"[donutTask.py]: {task.artifacts}")

asyncio.run(main())