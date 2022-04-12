FROM ubuntu:20.04

COPY . ./frontend
RUN apt update
RUN apt install nodejs -y
RUN apt install npm -y
RUN cd /frontend

EXPOSE 3000

CMD ["npm", "start"]
# FROM node:17

# COPY . ./frontend
# RUN cd /frontend
