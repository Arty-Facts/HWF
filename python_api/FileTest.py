import flatbuffers
import File
from  websocket import create_connection

#BUFFER_SIZE = 1990000000
BUFFER_SIZE = 19900

# main function, turn file -> flatbuffers and send them
def send_fb_file(filename):

    file = open(filename, "rb")
    output_file = open("test.png", "wb")

    packet_count = 0
    byte = file.read(BUFFER_SIZE)
    debug_use_flatbuffer(byte, filename, packet_count, output_file)
    packet_count += 1

    while byte:
        print("progress: ", packet_count, "/?")
        byte = file.read(BUFFER_SIZE)

        # skicka flatbuffer med byte i
        debug_use_flatbuffer(byte, filename, packet_count, output_file)
        packet_count += 1

    debug_use_flatbuffer([], filename, packet_count, output_file, True)
        
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
    output = build_flatbuffer(byte, filename, nr, eof)

    # open flatbuffer and write data to file:
    file = File.File.GetRootAsFile(output, 0)
    name = file.Filename()
    file_eof = file.Eof()

    print("writing data to ", name, ", eof: ", file_eof, ", data len: ", file.DataLength(), "...")

    for i in range(file.DataLength()):
        #if file.Data(i):
        #print("data=", (file.Data(i)).to_bytes(1, "big", signed=True))
        output_file.write((file.Data(i)).to_bytes(1, "big", signed=True))
        #else:
        #    print("could not write, data=", (file.Data(i)).to_bytes(1, "big", signed=True))

    if file_eof:
        output_file.close()
        print("closed file.")


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
    send_fb_file("hellgo.png")
    print("done!! enjoy")
n




