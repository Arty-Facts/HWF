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

TASK = 1
RESULT = 2
GET_RESULT = 2
HARDWARE_POOL = 3
GET_HARDWARE_POOL = 3
FILE = 4

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
        self.track_time = track_time
        self.track_ram = track_ram
        self.track_cpu = track_cpu
        self.track_gpu = track_gpu
        self.comment = comment

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

    def dispatch(self, hardware=None, task=None, priority=0):
        buffer = _build_message(TASK, task)
        self.socket.send_binary(buffer)  
  

def _build_message(msg_type, data):
    
    builder = flatbuffers.Builder(0)
    if msg_type == TASK:
        builder, done_body = _build_task(builder, data)
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

def _build_task(builder, task):
    serialized_stages = []
    serialized_artifacts = []

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
    FbTask.TaskAddStages(builder, stage_vector)
    FbTask.TaskAddArtifacts(builder, artifact_vector)
    done_task = FbTask.TaskEnd(builder)

    return builder, done_task

def _build_get_result(builder, jobs):
    pass

def _build_get_hardware_pool(builder, hardware):
    pass

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

def _build_file(builder, file):
    return