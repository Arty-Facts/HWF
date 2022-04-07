import flatbuffers
import websocket as ws
import sys
sys.path.append("../../.") #Append project root directory so importing from schema works

import schema.GetHardwarePool as GetHardwarePool
import schema.GetJobs as GetJobs
import schema.Message as Message
import schema.Task as Task
import schema.Stage as Stage

class Task:
    def __init__(self, *actions):
        self.stages = []
        self.artifacts = []
        for action in actions:
            if isinstance(action, Stage):
                self.stages.append(action)
            elif isinstance(action, Artifacts):
                self.artifacts.append(action)
            else:
                raise RuntimeError(f"{type(action)} is not supported!")

class Stage:
    def __init__(self, name = None, data = None, cmd = None, track_time = True, track_ram = False, track_cpu = False, track_gpu = False, comment="" ):
        self.name = name,
        self.data = data,
        self.cmd = cmd,
        self.track_time = track_time,
        self.track_ram = track_ram,
        self.track_cpu = track_cpu,
        self.track_gpu = track_gpu,
        self.comment = comment

class Artifacts:
    def __init__(self, *files):
        self.files_to_get = files

class Result:
    pass

class Hub:
    def __init__(self, ip_address=None):
        self.ip_address = ip_address
        self.conected = False
        self.socket = ws.WebSocket()
        
        self.connect()

    def __enter__(self):
        #self.connect()
        pass

    def __exit__(self ,type, value, traceback):
        #self.disconnect()
        pass

    def __del__(self):
        self.disconnect()
        
    def connect(self):
        #When fully implemented use self.ip_address, for now we connect to localhost 3001.
        self.socket.connect(self.ip_address)
        #self.ws = create_connection("ws://localhost:3001")
        
    
    def disconnect(self):
        self.socket.close()
        pass

    def get(self, *hardware): #outside mvp
        pass
    
    def get_jobs(self, job_ids, wait=True): #outside mvp

        pass

    def get_hardware_pool(self): #outside mvp

        pass

    def dispatch_async(self, hardware=None, task=None, priority=0): #outside mvp
        

        pass

    def dispatch(self, hardware=None, task=None, priority=0):
        # cmd_to_send = task[0].cmd #later on we will just send the task, for now use the cmd
        # placeholder_id = 1 #schema will be changed later
        # placeholder_filename = "hellgo.png" #schema will be changed later
        # buf = self.__build_binary_message(placeholder_id, cmd_to_send, placeholder_filename)


        # # create bin file from message
        # global binFile
        # with open(binFile, "wb") as bin:
        #     bin.write(buf)
        buffer = fb_build_task(task)
        self.socket.send_binary(buffer)  


def fb_build_task(task):

    builder = flatbuffers.Builder(0)

    stages = fb_build_stages(task)
    Task.Start(builder)

    
    

def fb_build_message(type, builder, data):
    
    if type == 1:
        fb_build_task(data)
    elif type == 2:
        fb_build_get_jobs()
        print("Unknown message type number. Aborting...")
        return

    Message.Start(builder)
    Message.AddType(builder, type)
    
    

    message = Message.End(builder)
    builder.Finish(message)
    buffer = builder.Output()

    return buffer
    pass


        