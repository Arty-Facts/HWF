# readme

## Instructions for installing mongodb

1. `sudo apt update`
2. `sudo apt install dirmngr gnupg apt-transport-https ca-certificates software-properties-common`

3. `wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -`
4. `sudo add-apt-repository 'deb [arch=amd64] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse'`

5. `sudo apt install mongodb-org`

6. `Start mongodb and enable start on boot: `sudo systemctl enable --now mongod`

7. `Create folder /data/db with `sudo mkdir /data/db`
8. `Do `sudo chown -R $USER /data/db` to ensure correct permissions

To run db server with set path use: `mongod --port 27017 --dbpath /data/db`


## Verify that db server is running
`mongo --eval 'db.runCommand({ connectionStatus: 1 })'`

## start, stop, restart and status commands

`sudo systemctl start mongod`

`sudo systemctl daemon-reload`

`sudo systemctl status mongod`

`sudo systemctl stop mongod`

`sudo systemctl restart mongod`

## Switch to another database

1. Enter mongo shell by typing `mongo` in the terminal
2. Input `use NAME` where NAME is the name of the database
3. 'show dbs' will display all the available databases
4. 'show collections' will display each collection in the current database
5. 'db.collectionName.find()' displays a collection's content.
