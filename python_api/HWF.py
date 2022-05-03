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


# NOTE TO FUTUTE SELF:
# vi bytte ut websocket mot websocketapp för att vi
# ville ha on_message för att det lät najs
# MEN det går inte så bra för att den är helt annorlunda
# och just nu så är den disconnected direkt efter connection
# pepehands

# om det inte går att använda websocketapp så borde
# vi ändra tillbaka till websocket istället :-(

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
        self.socket = ws.WebSocketApp(ip_address, 
                    on_message = lambda ws,msg: self.on_message(ws, msg),
                    on_error   = lambda ws,msg: self.on_error(ws, msg),
                    on_close   = lambda ws:     self.on_close(ws),
                    on_open    = lambda ws:     self.on_open(ws))

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
        print("MESSAGE RECEIVED :o")
        print(message)

        if isinstance(message, str):
            # send all files after we have sent the task
            # for stage in task.stages:
            #     if len(stage.data):
            #         self.send_files(stage)
            if message == "200":
                print("yay time to send my files :)")

            elif message == "300":
                print("wow")

            elif message == "400":
                print(":(")

        else:
            print("uh oh trouble")

            # handle flatbuffers here!!!!!


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
    
    def get_result(self, job_ids, wait=True): #outside mvp
        pass

    def get_hardware_pool(self): #outside mvp
        pass

    def dispatch_async(self, hardware=None, task=None, priority=0): #outside mvp
        pass

    async def dispatch(self, hardware=None, task=None, priority=0, cpu=None, gpu=None, os=None):

        print("building task...")

        # send task to hub
        buffer = _build_message(TASK, task)
        #self.socket.send_binary(buffer)

        print("sending task...")
        self.socket.send(buffer, ws.ABNF.OPCODE_BINARY)

        print("task sent! awaiting response...")


        # DELETE THIS WHEN ON_MESSAGE IS DONE

        # response = await self.socket.recv()
        # if response == "200":
        #     # send all files after we have sent the task
        #     for stage in task.stages:
        #         if len(stage.data):
        #             self.send_files(stage)

        # response = await self.socket.recv()
        # if response == "200":
        #     print("yay i did it :-D")
        
    def send_files(self, stage):

        # process each file in the data vector
        for current_file in self.data:
            self.process_file(current_file)

    def process_file(self, data):
        file = open(data.path, "rb")

        self.packet_nr = 0

        byte = file.read(BUFFER_SIZE)
        self.dispatch_file(byte, data.filename, packet_count)
        packet_count += 1

        while byte:
            #print("progress: ", packet_count, "/?")
            byte = file.read(BUFFER_SIZE)

            # skicka flatbuffer med byte i
            self.dispatch_file(byte, data.filename, packet_count)
            packet_count += 1

        self.dispatch_file(bytearray(), data.filename, packet_count, True)
            
        file.close()

    def dispatch_file(self, byte, filename, nr, eof=False):
        buffer = _build_message(FILE, [byte, filename, nr, eof])
        #self.socket.send_binary(buffer)  
        self.socket.send(buffer, ws.ABNF.OPCODE_BINARY)

  

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
    pass

def _build_get_hardware_pool(builder, hardware):
    pass
