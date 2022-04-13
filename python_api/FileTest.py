import flatbuffers

BUFFER_SIZE = 1990000000

# main function, turn file -> flatbuffers and send them
def send_fb_file(filename)

    file = open(filename, "rb")

    byte = file.read(BUFFER_SIZE)

    while byte:
        print(byte)
        byte = file.read(BUFFER_SIZE)

        # skicka flatbuffer med byte i
        send_flatbuffer(byte)

    send_flatbuffer([], True)
        


    file.close()

'''
table File {

    filename:string;
    packetnumber:int; 
    eof:bool; 
    data:[byte];
}
'''

def build_flatbuffer(byte, filename, nr, eof=False)
    builder = flatbuffers.Builder(0)

    fname = builder.CreateString(filename)
    data = builder.CreateByteVector(byte)

    FbFile.Start(builder)
    FbFile.AddFILENAME(fname)
    FbFile.AddPACKETNR(nr)
    FbFile.AddEOF(eof)
    FbFile.AddDATA(builder, data)

    ready_file = FbFile.End(builder)
    builder.Finish(ready_file)

    return builder.Output()


