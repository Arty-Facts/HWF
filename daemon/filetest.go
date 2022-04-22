package main

import (
	"fmt"
	"io"
	"log"
	"os"

	flatbuffers "github.com/google/flatbuffers/go"

	schema "test.com/test"
)

func send_fb_file(filename string, output_filename string) {
	// 20 MB:
	read_size := 20000000
	//read_size := 20000

	// open the input file
	file, err := os.Open(filename)

	if err != nil {
		log.Fatal(err)
	}

	// open the output file
	output, err := os.OpenFile(output_filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	if err != nil {
		log.Fatal(err)
	}

	// read the input file in chunks
	// putting each in flatbuffer and then unpacking
	// before reading the next chunk
	packet_count := 0
	bytes := make([]byte, read_size)
	for {
		amount_read, err := file.Read(bytes)

		if err != nil {
			if err == io.EOF {
				fmt.Println("- end of file reached! -")

				// send empty packet at the end with EOF = true
				empty := make([]byte, 0)
				debug_use_flatbuffer(empty, filename, output, packet_count)
				break
			}
			log.Fatal(err)
		}

		// do something with read bytes:
		debug_use_flatbuffer(bytes[0:amount_read], filename, output, packet_count)

		packet_count += 1
	}

}

func debug_use_flatbuffer(bytes []byte, filename string, output_file *os.File, packet_count int) {

	// check (if bytes empty) -> set eof to true
	end := false
	if len(bytes) == 0 {
		end = true
	}

	// build flatbuffer using read bytes
	output := build_flatbuffer(bytes, filename, packet_count, end)

	// get contents from flatbuffer
	fb_file := schema.GetRootAsFile(output, 0)
	name := fb_file.Filename()
	nr := fb_file.Packetnumber()
	eof := fb_file.Eof()
	arr := fb_file.DataBytes()

	// save arr to output file
	output_file.Write(arr)

	fmt.Println(string(name), "|", nr, "/398", eof)
}

func build_flatbuffer(bytes []byte, filename string, packet_count int, eof bool) []byte {
	builder := flatbuffers.NewBuilder(0)
	fname := builder.CreateString(filename)
	arr := builder.CreateByteVector(bytes)

	schema.FileStart(builder)
	schema.FileAddFilename(builder, fname)
	schema.FileAddPacketnumber(builder, int32(packet_count))
	schema.FileAddEof(builder, eof)
	schema.FileAddData(builder, arr)
	binFile := schema.FileEnd(builder)

	builder.Finish(binFile)

	return builder.FinishedBytes()
}

func main() {
	// 8 gb file:
	send_fb_file("portal2.zip", "ouputCOOL.zip")

	// 103 kb file:
	//send_fb_file("hellgo.png", "HELLLLLL.png")
}
