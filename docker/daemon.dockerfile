#"Daemon" is the name of the container
#Remove no-cache when completed, look it up
#docker build --no-cache -t daemon -f ./docker/daemon.dockerfile ./
#docker run -it daemon bash

FROM ubuntu:20.04

RUN apt-get update; DEBIAN_FRONTEND=noninteractive apt-get install golang-go git -y

COPY ./daemon/ ./daemon

RUN cd ./daemon/; go mod tidy; cd ./Message/; go mod tidy

