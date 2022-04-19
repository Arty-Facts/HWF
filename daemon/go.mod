module daemon

go 1.17

require (
	//github.com/google/flatbuffers/go
	github.com/gorilla/websocket v1.5.0
	test.com/test v0.0.0
)

require github.com/google/flatbuffers v2.0.6+incompatible // indirect

//require  // indirect

//require github.com/google/flatbuffers v2.0.6+incompatible // indirect

replace test.com/test => ./schema
