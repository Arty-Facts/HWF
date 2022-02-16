package main

import (
	"context"
	"net"
)

func main() {
	// test
	tcp_init("127.0.0.1")
}

// idk
func run_daemon() {
	// för att göra background thread?
	ctx := context.Background()

}

func tcp_init(addr string) {

	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	//"tcp", "udp", "ip4:1", "ip6:ipv6-icmp", "ip6:58"

	//Known networks are "tcp", "tcp4" (IPv4-only), "tcp6" (IPv6-only), "udp",
	//"udp4" (IPv4-only), "udp6" (IPv6-only), "ip", "ip4" (IPv4-only), "ip6" (IPv6-only),
	//"unix", "unixgram" and "unixpacket".

	if err == nil {
		// connection established OK?
		panic(err)
		return
	}

	// to-do: felhantering här

}
