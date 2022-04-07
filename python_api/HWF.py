import flatbuffers
import websocket as ws
import sys
import os

sys.path.append(".")

script_dir = os.path.dirname( __file__ )
schema_dir = os.path.join( script_dir, '..', 'schema')
sys.path.append( schema_dir )
 
import schema.GetHardwarePool as FbGetHardwarePool
import schema.GetResult as FbGetResult
import schema.Message as FbMessage
import schema.Task as FbTask
import schema.Stage as FbStage

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
        # cmd_to_send = task[0].cmd #later on we will just send the task, for now use the cmd
        # placeholder_id = 1 #schema will be changed later
        # placeholder_filename = "hellgo.png" #schema will be changed later
        # buf = self.__build_binary_message(placeholder_id, cmd_to_send, placeholder_filename)


        # # create bin file from message
        # global binFile
        # with open(binFile, "wb") as bin:
        #     bin.write(buf)
        buffer = fb_build_message(1, task)
        self.socket.send_binary(buffer)  




    
    

def fb_build_message(type, data):
    
    builder = flatbuffers.Builder(0)

    if type == 1:
        builder, done_task = fb_build_task(builder, data)
        FbMessage.Start(builder)
        FbMessage.AddTask(builder, done_task)

    elif type == 2:
        builder, done_result = fb_build_get_result(builder, data)
        FbMessage.Start(builder)
        FbMessage.AddGetResult(builder, done_result)
    
    elif type == 3:
        builder, done_hardware_pool = fb_build_get_hardware_pool(builder, data)
        FbMessage.Start(builder)
        FbMessage.AddGetHardwarePool(builder, done_hardware_pool)
        
    else:
        print("Unknown message type number. Aborting...")
        return
    

    
    FbMessage.AddType(builder, type)
    message = FbMessage.End(builder)
    builder.Finish(message)
    buffer = builder.Output()

    return buffer

def fb_build_task(builder, task):
    serialized_stages = []
    serialized_artifacts = []

    if len(task.stages) > 0:    
        for stage in task.stages:
            builder, done_stage = fb_build_stage(builder, stage)
            serialized_stages.append(done_stage)

        FbTask.StartStagesVector(builder, len(task.stages))

        for stage in serialized_stages:
            builder.PrependUOffsetTRelative(stage)
        
        stage_vector = builder.EndVector()
    if len(task.artifacts) > 0:
        
        for artifact in task.artifacts:
            for file in artifact.files:
                serialized_artifacts.append(builder.CreateString(file))

        FbTask.StartArtifactsVector(builder, len(serialized_artifacts))    

        for artifact in serialized_artifacts:
            builder.PrependUOffsetTRelative(artifact)    
        
        artifact_vector = builder.EndVector()

    FbTask.Start(builder)
    FbTask.AddStages(builder, stage_vector)
    FbTask.AddArtifacts(builder, artifact_vector)
    done_task = FbTask.End(builder)

    return builder, done_task

def fb_build_get_result(builder, jobs):
    pass

def fb_build_get_hardware_pool(builder, hardware):
    pass

def fb_build_stage(builder, stage):


    if len(stage.cmd) > 0:
        
        cmd_serialized = []
        if type(stage.cmd) == list:
            for cmd in stage.cmd:
                cmd_serialized.append(builder.CreateString(cmd))
                
        else:
            cmd_serialized.append(builder.CreateString(stage.cmd))

        FbStage.StartCmdListVector(builder, len(stage.cmd))

        for item in cmd_serialized:
            builder.PrependUOffsetTRelative(item)

        cmd_vector = builder.EndVector()

    stage_name = builder.CreateString(stage.name)
    stage_comment = builder.CreateString(stage.comment)
    FbStage.Start(builder)

    FbStage.AddName(builder, stage_name)
    #TODO: FbStage.AddData(builder, stage.data)
    FbStage.AddCmdList(builder, cmd_vector)
    FbStage.AddTrackTime(builder, stage.track_time)
    FbStage.AddTrackRam(builder, stage.track_ram)
    FbStage.AddTrackCpu(builder, stage.track_cpu)
    FbStage.AddTrackGpu(builder, stage.track_gpu)
    FbStage.AddComment(builder, stage_comment)

    done_stage = FbStage.End(builder)

    return builder, done_stage

        