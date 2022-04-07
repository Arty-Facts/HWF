#!/usr/bin/env python3

import subprocess
import os
import time

def main():
    subprocess.run(["gnome-terminal", "-e", "node ./server/dist/server.js"])
    os.chdir("./daemon")
    subprocess.run(["gnome-terminal", "-e", "go run hell.go"])
    os.chdir("../frontend")
    subprocess.run(["gnome-terminal", "-e", "npm start"])
    time.sleep(1)
    os.chdir("../python_api")
    subprocess.run(["gnome-terminal", "-e", "python3 testapi2.py"])

if __name__ == "__main__":
    main()