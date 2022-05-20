module daemon

go 1.17

require (
	//github.com/google/flatbuffers/go
	github.com/gorilla/websocket v1.5.0
	test.com/test v0.0.0
)

require (
	github.com/StackExchange/wmi v1.2.1 // indirect
	github.com/ghodss/yaml v1.0.0 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/google/flatbuffers v2.0.6+incompatible // indirect
	github.com/jaypipes/ghw v0.9.0 // indirect
	github.com/jaypipes/pcidb v1.0.0 // indirect
	github.com/lufia/plan9stats v0.0.0-20211012122336-39d0f177ccd0 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/power-devops/perfstat v0.0.0-20210106213030-5aafc221ea8c // indirect
	github.com/shirou/gopsutil/v3 v3.22.4 // indirect
	github.com/tklauser/go-sysconf v0.3.10 // indirect
	github.com/tklauser/numcpus v0.4.0 // indirect
	github.com/yusufpapurcu/wmi v1.2.2 // indirect
	golang.org/x/sys v0.0.0-20220319134239-a9b59b0215f8 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	howett.net/plist v1.0.0 // indirect
)

//require  // indirect

//require github.com/google/flatbuffers v2.0.6+incompatible // indirect

replace test.com/test => ./schema
