from . import HWF

test1 = HWF.Task(
    HWF.Stage( # a stage has a name that is stored in db and web 
        name = "setup",
        data = [ HWF.data( path="path/to/image.raw", name="in.raw"),
                 HWF.data( path="path/to/run.exe", name="run.exe")
               ],
        cmd = [ "curl http://internal.url.get.stuff", # if a list run one at the time
                "run cmd"
              ]
        track_time = True,
        comment="extre info store in db and web"
    ),
    HWF.Stage(
        name = "run cool stuff",
        cmd = "run.exe in.raw out.raw > log.txt" # run the command
        track_time = True,
        track_ram = True,
        comment="extre info store in db and web"
    )
    HWF.Artifacts( # get some files back
        "log.txt",
        "out.raw"
    )
)
id_test = []
with HWF.Hub(ip_address="xx.xxx.xxx.xx") as hub:
    hw_pool = hub.get_hardware_pool()

    for hw in hw_pool.get("cpu"): # get all the uniq cpus
        id_test.append(hub.dispatch_async(hardware=hw, exec=test1, priority=10))

    for hw in hw_pool.get("cpu", "gpu", "os"): #get all available cpu gpu and os combose
        id_test.append(hub.dispatch_async(hardware=hw, exec=test1, priority=1))

# disconect from the hub

hub = HWF.hub(ip_address="xx.xxx.xxx.xx") # connect to the hub 
for result in hub.get_result(id_test, wait=True): # get the jobs with strategy first done first served, if wait=True wait for a job to be done, else skip if not done.
    if result.exit_code != 0:
        print(result.stderr)
        continue
    failed=False
    if (time := result.stage("run cool stuff").time()) > 900: 
        #Atually result.stage["run cool stuff"].time()
        #result.stage.cmd() gives all info about commands in one big dict?
        print(f"failed on time for hardware: {time}ms {result.hardware}")
        failed = True

    if (ram := result.stage("run cool stuff").ram) > 2**20:
        print(f"failed on ram usage for hardware: {ram}b  on {result.hardware}")
        failed = True

    if failed:
        with open(result.artifacts("log.txt")) as f:
            print(f.readlines())

