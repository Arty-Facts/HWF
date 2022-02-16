package main

import (
	//"context"
	"fmt"
	"net"
	"net/url"

	"log"

	"github.com/gorilla/websocket"
)

// gorilla websocket
func main() {
	// test IP

	u := url.URL{
		Scheme: "ws",
		Host:   "localhost:3000",
		Path:   "/",
	}
	connection, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal(err)
	}

	// close connection once we go out of scope?
	defer connection.Close()

	var msg = []byte("hello world!")
	// there is also websocket.BinaryMessage
	connection.WriteMessage(websocket.TextMessage, msg)

	ch := make(chan []byte)
	errCh := make(chan error)

	go func(ch chan []byte, errCh chan error) {
		for {
			_, message, err := connection.ReadMessage()
			if err != nil {
				errCh <- err
			}
			ch <- message
		}
	}(ch, errCh)

	for {
		select {
		case data := <-ch:
			// om ch innehåller något
			fmt.Println(string(data))

		case err := <-errCh:
			// om vi har fått en error under read
			fmt.Println(err)
			break
		}
	}
}

// WIP
func run_daemon() {
	// för att göra background thread?
	//ctx := context.Background()

}

func tcp_init(addr string) net.Conn {

	conn, err := net.Dial("tcp", addr)
	//"tcp", "udp", "ip4:1", "ip6:ipv6-icmp", "ip6:58"

	//Known networks are "tcp", "tcp4" (IPv4-only), "tcp6" (IPv6-only), "udp",
	//"udp4" (IPv4-only), "udp6" (IPv6-only), "ip", "ip4" (IPv4-only), "ip6" (IPv6-only),
	//"unix", "unixgram" and "unixpacket".

	// felhantering
	if err != nil {
		panic(err)
	}

	// connection OK
	return conn
}
