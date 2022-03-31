from turtle import setundobuffer
import HWFMessage

import flatbuffers
from websocket import create_connection

class Task:
    def __init__(self, *actions):
        stages = []
        artifacts = []
        for action in actions:
            if isinstance(action, Stage):
                stages.append(action)
            elif isinstance(action, Artifacts):
                artifacts.append(action)
            else:
                raise RuntimeError(f"{type(action)} is not supported!")

class Stage:
    def __init__(self, name = None, data = None, cmd = None, timeit = True, ram_usage = True, comment="" ):
        self.name = name,
        self.data = data,
        self.cmd = cmd,
        self.timeit = timeit,
        self.ram_usage = ram_usage,
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

    def __enter__(self):
        self.connect()
        

    def __exit__(self ,type, value, traceback):
        self.disconnect()
        

    def connect(self):
        #When fully implemented use self.ip_address, for now we connect to localhost 3001.
        ws = create_connection(self.ip_address)
        #self.ws = create_connection("ws://localhost:3001")
        

    def disconnect(self):
        self.ws.close()
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
        cmd_to_send = task[0].cmd #later on we will just send the task, for now use the cmd
        placeholder_id = 1 #schema will be changed later
        placeholder_filename = "hellgo.png" #schema will be changed later
        buf = self.__build_binary_message(placeholder_id, cmd_to_send, placeholder_filename)

        # create bin file from message
        global binFile
        with open(binFile, "wb") as bin:
            bin.write(buf)
       
        self.ws.send_binary(buf)  
        

    
    def __build_binary_message(_agentId, _cmd, _srcFile):
        fbb = flatbuffers.Builder(1024)
        # create cmd string
        cmd = fbb.CreateString(_cmd)

        # create srcfile byte arr
        with open(_srcFile, "rb") as bin:
            readBytes = bin.read()

        byteVector = fbb.CreateByteVector(readBytes)
        
        HWFMessage.MessageStart(fbb)
        # agent id is temporary since server doesn't assign tasks yet
        HWFMessage.MessageAddAgentId(fbb, _agentId)
        HWFMessage.MessageAddCmd(fbb, cmd)
        HWFMessage.MessageAddData(fbb, byteVector)

        readyMsg = HWFMessage.MessageEnd(fbb)
        fbb.Finish(readyMsg)
        return fbb.Output()