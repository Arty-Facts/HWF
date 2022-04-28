import flatbuffers
import websocket as ws
import sys
import os

sys.path.append(".")
sys.path.append("../.")

# script_dir = os.path.dirname( __file__ )
# schema_dir = os.path.join( script_dir, '..', 'schema')
# sys.path.append( schema_dir )
 
import schema.GetHardwarePool as FbGetHardwarePool
import schema.GetResult as FbGetResult
import schema.Message as FbMessage
import schema.MessageBody as FbMessageBody
import schema.Task as FbTask
import schema.Stage as FbStage
import schema.File as FbFile
import schema.Hardware as FbHardware
import schema.Data as FbData

TASK = 1
RESULT = 2
GET_RESULT = 2
HARDWARE_POOL = 3
GET_HARDWARE_POOL = 3
FILE = 4

# 1.99 GB
#BUFFER_SIZE = 1990000000

# 1.99 MB
BUFFER_SIZE = 1990000

# 50 MB
#BUFFER_SIZE = 500000000

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
        self.name = name
        self.data = data
        self.cmd = cmd #Will be string or array of strings

        # file information
        self.packet_nr = 0
        self.transmitted_files = []

        self.track_time = track_time
        self.track_ram = track_ram
        self.track_cpu = track_cpu
        self.track_gpu = track_gpu

        self.comment = comment

class Data:
    def __init__(self, path, filename):
        self.path = path
        self.filename = filename

class Artifacts:
    def __init__(self, *files):
        self.files = files

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
    
    def get_result(self, job_ids, wait=True): #outside mvp
        pass

    def get_hardware_pool(self): #outside mvp
        pass

    def dispatch_async(self, hardware=None, task=None, priority=0): #outside mvp
        pass

    def dispatch(self, hardware=None, task=None, priority=0, cpu=None, gpu=None, os=None):
        buffer = _build_message(TASK, task)
        self.socket.send_binary(buffer)

        if len(self.data):
            self.send_files()

    def send_files(self):

        for current_file in self.data:
            self.process_file(current_file)

    def process_file(self, data):
        file = open(data.path, "rb")

        self.packet_nr = 0

        byte = file.read(BUFFER_SIZE)
        self.dispatch_file(byte, data.filename)
        packet_count += 1

        while byte:
            #print("progress: ", packet_count, "/?")
            byte = file.read(BUFFER_SIZE)

            # skicka flatbuffer med byte i
            self.dispatch_file(byte, data.filename)
            packet_count += 1

        self.dispatch_file(bytearray(), data.filename, True)
            
        file.close()

    def dispatch_file(self, byte, filename, eof=False):
        buffer = _build_message(FILE, byte)
        self.socket.send_binary(buffer)  
  

def _build_message(msg_type, data, cpu="any", gpu="any", os="any"):
    
    builder = flatbuffers.Builder(0)
    if msg_type == TASK:
        builder, done_body = _build_task(builder, data, cpu, gpu, os)
        body_type = FbMessageBody.MessageBody.Task

    elif msg_type == GET_RESULT:
        builder, done_body = _build_get_result(builder, data)
        body_type =FbMessageBody.MessageBody.GetResult
    
    elif msg_type == GET_HARDWARE_POOL:
        builder, done_body = _build_get_hardware_pool(builder, data)
        body_type =FbMessageBody.MessageBody.GetHardwarePool

    elif msg_type == FILE:
        builder, done_body = _build_file(builder, data)
        body_type =FbMessageBody.MessageBody.File
    else:
        print("Unknown message type number. Aborting...")
        return
    
    FbMessage.MessageStart(builder)
    FbMessage.MessageAddType(builder, msg_type)
    FbMessage.MessageAddBodyType(builder, body_type)
    FbMessage.MessageAddBody(builder, done_body)


    message = FbMessage.MessageEnd(builder)
    builder.Finish(message)
    buffer = builder.Output()

    return buffer

def _build_task(builder, task, cpu, gpu, os):
    serialized_stages = []
    serialized_artifacts = []
    builder, done_hardware = _build_hardware(builder, cpu, gpu, os)
    if len(task.stages) > 0:    
        for stage in task.stages:
            builder, done_stage = _build_stage(builder, stage)
            serialized_stages.append(done_stage)

        FbTask.TaskStartStagesVector(builder, len(task.stages))

        for stage in reversed(serialized_stages):
            builder.PrependUOffsetTRelative(stage)
        
        stage_vector = builder.EndVector()


    if len(task.artifacts) > 0:
        for artifact in task.artifacts:
            for file in artifact.files:
                serialized_artifacts.append(builder.CreateString(file))

        FbTask.TaskStartArtifactsVector(builder, len(serialized_artifacts))    

        for artifact in reversed(serialized_artifacts):
            builder.PrependUOffsetTRelative(artifact)    
        
        artifact_vector = builder.EndVector()


    FbTask.TaskStart(builder)
    FbTask.TaskAddHardware(builder, done_hardware)
    FbTask.TaskAddStages(builder, stage_vector)
    FbTask.TaskAddArtifacts(builder, artifact_vector)
    done_task = FbTask.TaskEnd(builder)

    return builder, done_task

def _build_hardware(builder, cpu=None, gpu=None, os=None):
    fb_hardware_cpu = builder.CreateString(cpu)
    fb_hardware_gpu = builder.CreateString(gpu)
    fb_hardware_os = builder.CreateString(os) 
    FbHardware.HardwareStart(builder)
    FbHardware.HardwareAddCpu(builder, fb_hardware_cpu)
    FbHardware.HardwareAddGpu(builder,fb_hardware_gpu)
    FbHardware.HardwareAddOs(builder,fb_hardware_os)
    done_hardware = FbHardware.HardwareEnd(builder)
    return builder, done_hardware   

def _build_stage(builder, stage):

    if len(stage.cmd) > 0:
        cmd_serialized = []
        if type(stage.cmd) == list:
            for cmd in stage.cmd:
                cmd_serialized.append(builder.CreateString(cmd))
            FbStage.StageStartCmdListVector(builder, len(stage.cmd))

        else:
            cmd_serialized.append(builder.CreateString(stage.cmd))
            FbStage.StageStartCmdListVector(builder,1)

        for item in reversed(cmd_serialized):
            builder.PrependUOffsetTRelative(item)
            

        cmd_vector = builder.EndVector()


    fb_stage_name = builder.CreateString(stage.name)
    fb_stage_comment = builder.CreateString(stage.comment)
    FbStage.StageStart(builder)

    FbStage.StageAddName(builder, fb_stage_name)
    #FbStage.AddData(builder, stage.data)
    FbStage.StageAddCmdList(builder, cmd_vector)
    FbStage.StageAddTrackTime(builder, stage.track_time)
    FbStage.StageAddTrackRam(builder, stage.track_ram)
    FbStage.StageAddTrackCpu(builder, stage.track_cpu)
    FbStage.StageAddTrackGpu(builder, stage.track_gpu)
    FbStage.StageAddComment(builder, fb_stage_comment)

    done_stage = FbStage.StageEnd(builder)

    return builder, done_stage

def _build_data(builder, path, filename):
    FbData.DataStart(builder)

    FbData.DataAddPath(builder, path)
    FbData.DataAddFilename(builder, filename)
    
    done_data = FbData.DataEnd(builder)

    return builder, done_data

def _build_file(builder, file):
    return

def _build_get_result(builder, jobs):
    pass

def _build_get_hardware_pool(builder, hardware):
    pass
