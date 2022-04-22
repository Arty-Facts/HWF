module daemon

go 1.17

require test.com/test v0.0.0

require github.com/google/flatbuffers/go v2.0.6+incompatible // indirect

replace test.com/test => ./schema
