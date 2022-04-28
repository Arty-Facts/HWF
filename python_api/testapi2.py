#import HWF
import HWFtest as HWF #För att testa nya schemat

task1 = HWF.Task(
    HWF.Stage(
        name = "Bob",
        cmd = ["ls -la > log.txt","echo banana"], # run the command
        files = ["portal2.zip"],
        comment = "Grapefruits are an excellent source of potassium."
    ),
    HWF.Artifacts( # get some files back
        "log.txt"
    )
)

id_test = []

hub = HWF.Hub(ip_address="ws://localhost:3001")
hub.dispatch(task=task1)



# "NoneType" object has no attribute "dispatch"??
# with HWF.Hub(ip_address="ws://localhost:3001") as hub:
#     hub.dispatch(task=task1)

    