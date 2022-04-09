#"Daemon" is the name of the container
#Remove no-cache when completed, look it up
#docker build --no-cache -t daemon -f ./docker/daemon.dockerfile ./
#docker run -it daemon bash

FROM golang:1.17.8alpine3.14

#RUN apt-get update; DEBIAN_FRONTEND=noninteractive apt-get install golang-go git -y

COPY . ./daemon
WORKDIR /daemon
RUN  go mod tidy; cd ./Message/; go mod tidy
RUN go build hell.go

CMD ./hell

