import flatbuffers
import File
import numpy
from  websocket import create_connection
from time import time

# 1.99 GB
#BUFFER_SIZE = 1990000000

# 1.99 MB
BUFFER_SIZE = 1990000

# 50 MB
#BUFFER_SIZE = 500000000


START_TIME = time()

# TO-DO:
# filen är seg som satan
# timea de olika delarna och kolla vad som är långsammast
# 100% CPU usage just nu
# kanske håller bytearray på och resizar arrayen hela tiden?
# kanske är det flatbuffer som är väldigt långsam?

# main function, turn file -> flatbuffers and send them
def send_fb_file(filename):

    file = open(filename, "rb")
    output_file = open("test.zip", "wb")

    packet_count = 0
    byte = file.read(BUFFER_SIZE)
    debug_use_flatbuffer(byte, filename, packet_count, output_file)
    packet_count += 1

    while byte:
        #print("progress: ", packet_count, "/?")
        byte = file.read(BUFFER_SIZE)

        # skicka flatbuffer med byte i
        debug_use_flatbuffer(byte, filename, packet_count, output_file)
        packet_count += 1

    debug_use_flatbuffer(bytearray(), filename, packet_count, output_file, True)
        
    file.close()

'''
table File {

    filename:string;
    packetnumber:int; 
    eof:bool; 
    data:[byte];
}
'''

def debug_use_flatbuffer(byte, filename, nr, output_file, eof=False):
    func_start_time = time()

    output = build_flatbuffer(byte, filename, nr, eof)
    print("build_flatbuffers", time() - func_start_time)

    # open flatbuffer and write data to file:
    fb_file = File.File.GetRootAsFile(output, 0)
    name = fb_file.Filename()
    file_eof = fb_file.Eof()

    print("OPEN FLATBUFFERS", time() - func_start_time)

    print("writing data to ", name, ", eof: ", file_eof, ", data len: ", fb_file.DataLength(), "...")

    #arr = []
    #arr = bytearray()
    #for i in range(fb_file.DataLength()):
        #if file.Data(i):
        #print("data=", (file.Data(i)).to_bytes(1, "big", signed=True))
        
        #arr.append((fb_file.Data(i)).to_bytes(1, "big", signed=True))
     #   arr.append(fb_file.Data(i))
        
        #print(fb_file.Data(i))
        #else:
        #    print("could not write, data=", (file.Data(i)).to_bytes(1, "big", signed=True))

    # arr = [fb_file.Data(i) for i in range(fb_file.DataLength())]

    if file_eof:
        output_file.close()
        print("closed file.")

    else:
        arr = fb_file.DataAsNumpy()

        print("MAKE ARR", time() - func_start_time)

        output_file.write(bytearray(arr))

        print("WRITE TO FILE", time() - func_start_time)
        #output_file.write(arr)


    

    print("debug_use_flatbuffers", time() - func_start_time)


def build_flatbuffer(byte, filename, nr, eof=False):
    builder = flatbuffers.Builder(0)

    fname = builder.CreateString(filename)
    data = builder.CreateByteVector(byte)
    

    # if something is not working, 
    # check that function names are correct!!!
    File.FileStart(builder)
    File.FileAddFilename(builder, fname)
    File.FileAddPacketnumber(builder, nr)
    File.FileAddEof(builder, eof)
    File.FileAddData(builder, data)
    ready_file = File.FileEnd(builder)

    builder.Finish(ready_file)

    return builder.Output()


    #ws connectio

if __name__ == "__main__":
    send_fb_file("portal2.zip")
    print("final time", time() - START_TIME)
    print("done!! enjoy")





