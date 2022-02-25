module daemon

go 1.17

require (
    github.com/gorilla/websocket v1.5.0
    test.com/test v0.0.0
    )

replace test.com/ => ./schema
