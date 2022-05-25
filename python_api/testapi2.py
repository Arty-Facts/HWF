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
    results = await hub.get_result(id_test)
    #print(results[0].time)
    print(results[0].artifacts)
    #print("HELP")
    result = await hub.get_hardware_pool()

    print(result)
    #print("hej")
    #hub.disconnect()
    
asyncio.run(main())


    