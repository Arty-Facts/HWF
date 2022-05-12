import flatbuffers
import websocket as ws
import sys
import os
import threading
import time

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
import schema.Result as FbResult

TASK = 1
RESULT = 2
GET_RESULT = 2
HARDWARE_POOL = 3
GET_HARDWARE_POOL = 3
FILE = 4
RESULT = 5

GB = 1000000000

# 1.99 GB
#BUFFER_SIZE = 1990000000

# 1.99 MB
FILE_BUFFER_SIZE = 1990000

# 4 GB
MEMORY = 4 * GB
BUFFER_SIZE = MEMORY // FILE_BUFFER_SIZE

# 50 MB
#BUFFER_SIZE = 500000000


# NOTE TO FUTUTE SELF:
# vi bytte ut websocket mot websocketapp för att vi
# ville ha on_message för att det lät najs
# MEN det går inte så bra för att den är helt annorlunda
# och just nu så är den disconnected direkt efter connection
# pepehands

# om det inte går att använda websocketapp så borde
# vi ändra tillbaka till websocket istället :-(

class Task:
    def __init__(self, *actions, hardware):
        self.stages = []
        self.artifacts = []
        self.hardware = hardware
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

        # # file information
        # self.packet_nr = 0
        # self.transmitted_files = []

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

class TaskResult:
    def __init__(self):
    
        self.stage = {} # {"stagename": StageResult}
        self.time = time()
        self.artifacts = {} # {"name.txt": "C:/Path/To/File/name.txt"}
        self.hardware #TODO: Put this in the schema

    def time(self, targetStage = None):
        time = 0
        if (targetStage):
            time = self.stage[targetStage].time
        else:
            for stage in self.stage:
                time += stage.time
        
        return time 

# "Stages" are contained in Result, unlike "Stage" which is to be sent to the hub
class StageResult:
    def __init__(self, name, commands):
        self.name = name
        self.time = self.time()
        self.cmd = {} # {"commandname": {"stdout": "blabla", "exit": 0}}

    def time(self, targetCmd = None):
        time = 0
        if(targetCmd):
            time = self.cmd[targetCmd].time
        else:
            for cmd in self.cmd:
                time += cmd.time
        #calculate total time taken for all contained commands
        return time

class CommandResult:
    def __init__(self):
        self.cmd
        self.exit
        self.stdout
        self.stderr
        self.cpu
        self.gpu
        self.ram
        self.time

class Hub:
    def __init__(self, ip_address=None):
        self.ip_address = ip_address
        self.conected = False
        self.socket = ws.WebSocketApp(ip_address, 
                    on_message = lambda ws,msg: self.on_message(ws, msg),
                    on_error   = lambda ws,msg: self.on_error(ws, msg),
                    on_close   = lambda ws:     self.on_close(ws),
                    on_open    = lambda ws:     self.on_open(ws))

        self.current_task = None
        self.tasks = {}

        self.locked = False
        self.recieved_result = []

        #threading.Thread(target=self.socket.run_forever, args=(None, None, 60, 30), daemon=True).start()
        #self.connect()

    def __enter__(self):
        #self.connect()
        pass

    def __exit__(self ,type, value, traceback):
        #self.disconnect()
        pass

    def __del__(self):
        self.disconnect()

    def on_message(self, ws, message):

        if isinstance(message, str):
            received = message.split()

            if received[0] == "200":
                self.tasks[received[1]] = self.current_task
                print("task was received and accepted, time to send files")
                self.send_files(received[1])

            elif received[0] == "242":
                self.tasks[received[1]] = self.current_task
                print("task was queued, might send files later :)")

            elif received[0] == "424":
                print("ok here we go time to send files :-O")
                self.send_files(received[1])

            elif received[0] == "404":
                print("no matching agents available at this time :((")

        elif isinstance(message, bytearray):
            self.recieved_result = deserialize_message(message)

        else:
            print("Error: Recieved a response of an invalid type")

            # handle flatbuffers here!!!!!

        # unlock the wait since we got response
        self.locked = False


    def on_error(self, ws, error):
        print(":D:D:D:D::D:D::D:D")
        print(error)

    def on_close(self, ws):
        print("connection CLOSED :(")

    def on_open(self, ws):
        print("connection opened :)")
        
    async def connect(self):
        #When fully implemented use self.ip_address, for now we connect to localhost 3001.
        
        # 2022-04-29
        #self.socket.connect(self.ip_address)

        threading.Thread(target=self.connect_socket).start()

        # make sure that websocket has started running properly
        # if this is not here, dispatch will run too quickly and result in
        # websocket._exceptions.WebSocketConnectionClosedException: socket is already closed.
        time.sleep(1)
        
        #self.socket.ws = create_connection("ws://localhost:3001")
        
    
    def connect_socket(self):
        self.socket.run_forever(ping_timeout=100)

    def disconnect(self):
        self.socket.close()
        pass

    def get(self, *hardware): #outside mvp
        pass
    
    async def get_result(self, job_ids, wait=True):

        buffer = _build_message(GET_RESULT, job_ids)
        self.socket.send(buffer, ws.ABNF.OPCODE_BINARY)

        self.locked = True

        while self.locked:
            time.sleep(0.2)
        
        result = self.recieved_result
        self.recieved_result = ""
        return result

    def get_hardware_pool(self): #outside mvp
        pass

    def dispatch_async(self, hardware=None, task=None, priority=0): #outside mvp
        pass

    async def dispatch(self, hardware=None, task=None, priority=0, cpu=None, gpu=None, os=None):

        self.current_task = task

        print("building task...")

        # send task to hub
        buffer = _build_message(TASK, task)
        #self.socket.send_binary(buffer)

        print("sending task...")
        self.socket.send(buffer, ws.ABNF.OPCODE_BINARY)


        print("task sent! awaiting response...")
        self.locked = True
         
        while self.locked:
            time.sleep(0.2)

        
    def send_files(self, id):
        # process each file in the data vector
        for current_stage in self.tasks[id].stages:
            for current_file in current_stage.data:
                self.process_file(current_file)

    def process_file(self, data):
        file = open(data.path, "rb")

        packet_count = 0

        while (byte := file.read(FILE_BUFFER_SIZE)):
            self.dispatch_file(byte, data.filename, packet_count)
            packet_count += 1

        self.dispatch_file(bytearray(), data.filename, packet_count, True)
            
        file.close()

    def dispatch_file(self, byte, filename, nr, eof=False):
        print("dispatching", nr)
        buffer = _build_message(FILE, [byte, filename, nr, eof])
        #self.socket.send_binary(buffer)  
        self.socket.send(buffer, ws.ABNF.OPCODE_BINARY)

  

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
        builder, done_body = _build_file(builder, data[0], data[1], data[2], data[3])
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
    builder, done_hardware = _build_hardware(builder, cpu = task.hardware["cpu"], gpu = task.hardware["gpu"], os = task.hardware["os"], ram = task.hardware["ram"])
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

def _build_hardware(builder, cpu=None, gpu=None, os=None, ram=None):
    fb_hardware_cpu = builder.CreateString(cpu)
    fb_hardware_gpu = builder.CreateString(gpu)
    fb_hardware_os = builder.CreateString(os) 
    fb_hardware_ram = builder.CreateString(ram)
    FbHardware.HardwareStart(builder)
    FbHardware.HardwareAddCpu(builder, fb_hardware_cpu)
    FbHardware.HardwareAddGpu(builder,fb_hardware_gpu)
    FbHardware.HardwareAddOs(builder,fb_hardware_os)
    FbHardware.HardwareAddRam(builder,fb_hardware_ram)
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

    # build all data flatbuffers
    datas = []
    if len(stage.data):
        for dat in stage.data:
            builder, built_data = _build_data(builder, dat.path, dat.filename)
            datas.append(built_data)

        FbStage.StageStartDataVector(builder, len(datas))

        for item in reversed(datas):
            builder.PrependUOffsetTRelative(item)

        data_vector = builder.EndVector()


    FbStage.StageStart(builder)
    FbStage.StageAddName(builder, fb_stage_name)

    if data_vector:
        FbStage.StageAddData(builder, data_vector)

    if cmd_vector:
        FbStage.StageAddCmdList(builder, cmd_vector)

    FbStage.StageAddTrackTime(builder, stage.track_time)
    FbStage.StageAddTrackRam(builder, stage.track_ram)
    FbStage.StageAddTrackCpu(builder, stage.track_cpu)
    FbStage.StageAddTrackGpu(builder, stage.track_gpu)

    FbStage.StageAddComment(builder, fb_stage_comment)

    done_stage = FbStage.StageEnd(builder)

    return builder, done_stage

def _build_data(builder, path, filename):
    fbpath = builder.CreateString(path)
    fname = builder.CreateString(filename)

    FbData.DataStart(builder)

    FbData.DataAddPath(builder, fbpath)
    FbData.DataAddFilename(builder, fname)
    
    done_data = FbData.DataEnd(builder)

    return builder, done_data

def _build_file(builder, byte, filename, nr, eof=False):
    fname = builder.CreateString(filename)
    data = builder.CreateByteVector(byte)

    FbFile.FileStart(builder)

    FbFile.FileAddFilename(builder, fname)
    FbFile.FileAddPacketnumber(builder, nr)
    FbFile.FileAddEof(builder, eof)
    FbFile.FileAddData(builder, data)

    done_file = FbFile.FileEnd(builder)

    return builder, done_file

def _build_get_result(builder, jobs):
    taskId_serialized = []
    if type(jobs) == list:
        for id in jobs:
            taskId_serialized.append(builder.CreateString(id))
    else:
        taskId_serialized.append(builder.CreateString(id))

    FbGetResult.GetResultStartIdListVector(builder, len(taskId_serialized))

    for id in taskId_serialized:
        builder.PrependUOffsetTRelative(taskId_serialized)
    
    taskId_vector = builder.EndVector()
    FbGetResult.GetResultStart(builder)
    
    FbGetResult.GetResultAddIdList(taskId_vector)
    FbGetResult.GetResultEnd(builder)

    done_file = FbGetResult.GetResultEnd(builder)
    
    return done_file, builder


def _build_get_hardware_pool(builder, hardware):
    pass

def deserialize_message(buffer):

    message = FbMessage.Message.GetRootAs(buffer ,0)
    type = message.BodyType()

    if type == FbMessageBody.MessageBody().Result:
        result = deserialize_result(message)
        return result
        
    else:
        print("Tried deserializing a message of an invalid type")
        return -1

def deserialize_result(message):

    result = TaskResult()

    resultTable = FbResult.Result()
    resultTable.Init(message.Body().Bytes, message.Body().Pos)

    if resultTable.Time() > 0:
        result.time = resultTable.Time()

    i = 0
    while i < resultTable.StagesLength:
        
        stage = StageResult()

        stageTable = resultTable.Stages(i)

        stage.name = stageTable.Name()

        x = 0
        while x < stageTable.CmdLength():
            
            cmd = CommandResult()
            cmdTable = stageTable.Cmd(x)
            cmd.cmd = cmdTable.Cmd()
            cmd.exit = cmdTable.Exit()
            cmd.stdout = cmdTable.Stdout()
            cmd.stderr = cmdTable.Stderr()
            cmd.os = cmdTable.Os()
            cmd.cpu = cmdTable.Cpu()
            cmd.gpu = cmdTable.Gpu()
            cmd.ram = cmdTable.Ram()
            cmd.time = cmdTable.Time()

            stage.cmd[cmdTable.Name()] = cmd
            x += 1

        result.stage[stageTable.Name()] = stage
        i += 1

    #TODO: artifacts, save on disk, then save path under key (file name) in result.artifacts
    return result

#for testing only
def temp():

    builder = flatbuffers.Builder(0)
    
    FbResult.Start(builder)
    FbResult.AddTime(builder, 420)
    resultbuf = FbResult.End(builder)
    

    FbMessage.Start(builder)
    FbMessage.AddBodyType(builder, FbMessageBody.MessageBody.Result)
    FbMessage.AddBody(builder, resultbuf)
    done = FbMessage.End(builder)
    builder.Finish(done)

    buf = builder.Output()

    print( deserialize_message(buf))

if __name__ == "__main__":
    print("don't run this")
    # temp()
    # print("done")