How to install (Ubuntu):

1.
sudo apt update
sudo apt install dirmngr gnupg apt-transport-https ca-certificates software-properties-common

2.
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
sudo add-apt-repository 'deb [arch=amd64] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse'

3.
sudo apt install mongodb-org


starta mongo daemon och enabla start on boot (?)
4.
sudo systemctl enable --now mongod

alt. bara starta mongodb-servern
mongod

verifiera att det fungerar med:
5.
mongo --eval 'db.runCommand({ connectionStatus: 1 })'