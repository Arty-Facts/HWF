from time import sleep
import HWF
import asyncio

async def main():
    slowTask = HWF.Task(
        HWF.Stage(
            name="Slowtask",
            cmd=["touch placeholder.txt", "sleep 15"],
            data = [HWF.Data("files/SPODERMAN.jpg", "spoderm4n.jpg")],
            track_time=True,
            track_ram=False,
            track_cpu=False,
            track_gpu=False,
            comment="This task is very slow"
        ),
        HWF.Artifacts("placeholder.txt"),
        hardware = {"os": "any", "gpu": "any", "cpu": "any", "ram": "any"}
    )

    queuedTask = HWF.Task(
        HWF.Stage(
            name="Queued task",
            cmd=["touch testResult.txt", "echo 'All done!' >> testResult.txt"],
            data = [HWF.Data("files/SPODERMAN.jpg", "spoderm4n.jpg")],
            track_time=True,
            track_ram=False,
            track_cpu=False,
            track_gpu=False,
            comment="This task should be queued"
        ),

        HWF.Artifacts("testResult.txt"),
        hardware = {"os": "any", "gpu": "any", "cpu": "any", "ram": "any"}
    )

    idList = []

    hub = HWF.Hub(ip_address="ws://localhost:3001")
    
    await hub.connect()
    idList.append(await hub.dispatch(task=slowTask))
    idList.append(await hub.dispatch(task=queuedTask))
    print(f"[queueTest.py]: idlist is [{idList}] ")
    sleep(20)
    results = await hub.get_result(idList)
    for task in results:
        if task.artifacts:
            print(f"[queueTest.py]: {task.artifacts}")

asyncio.run(main())