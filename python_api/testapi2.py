#import HWF
import time
import HWF as HWF #För att testa nya schemat
import asyncio

async def main():
    task1 = HWF.Task(
    HWF.Stage(
        name = "Bob",
        cmd = ["ls -la > log.txt","echo banana"], # run the command
        data = [HWF.Data("files/SPODERMAN.jpg", "spoderm4n.jpg")],
        #data = [HWF.Data("files/SPODERMAN.jpg", "sPoD3rm4N.jpg")],
        comment = "Grapefruits are an excellent source of potassium."
    ),
    HWF.Stage(
        name = "Bobson",
        cmd = ["ls -la > hog.txt","echo banana"], # run the command
        data = [HWF.Data("files/SPODERMAN.jpg", "spoderm4n222222222222.jpg")],
        #data = [HWF.Data("files/SPODERMAN.jpg", "sPoD3rm4N.jpg")],
        comment = "Grapefruits are an excellent source of potassium."
    ),
    HWF.Stage(
        name = "Bobby",
        cmd = ["ls -la > fog.txt","echo banana"], # run the command
        data = [HWF.Data("files/SPODERMAN.jpg", "spoderm4n2222333333222.jpg")],
        #data = [HWF.Data("files/SPODERMAN.jpg", "sPoD3rm4N.jpg")],
        comment = "Grapefruits are an excellent source of potassium."
    ),
    HWF.Artifacts( # get some files back
        "log.txt"
    ),
    hardware = {"os": "any", "gpu": "any", "cpu": "any", "ram": "any"}
)

    """"
    id_test = []

    hub = HWF.Hub(ip_address="ws://localhost:3001")
    await hub.dispatch(task=task1)
    """

    id_test = []

    hub = HWF.Hub(ip_address="ws://localhost:3001")
    await hub.connect()

    id_test.append(await hub.dispatch(task=task1))
    
    time.sleep(5)
    results = await hub.get_result(id_test)
    print("All done with get_result() :)")
    print(results[0].hardware)
    print(results[0].time)
    print(results[0].stage)
    for stage in results[0].stage:
        print(stage)

    #await hub.dispatch(task=task1)

    #await hub.dispatch(task=task1)

    #await hub.dispatch(task=task1)


# "NoneType" object has no attribute "dispatch"??
# with HWF.Hub(ip_address="ws://localhost:3001") as hub:
#     hub.dispatch(task=task1)

#main()

asyncio.run(main())

    