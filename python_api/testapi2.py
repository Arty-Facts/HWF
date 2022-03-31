from . import HWF

task1 = HWF.Task(
    HWF.Stage(
        name = "Olof",
        cmd = "ls -la > log.txt", # run the command
        timeit = False,
        ram_usage = False,
        comment = "Bananas are an excellent source of potassium."
    ),
    HWF.Artifacts( # get some files back
        "log.txt"
    )
)

id_test = []

with HWF.Hub(ip_address="ws://localhost:3001") as hub:
    hub.dispatch(task=task1)

    