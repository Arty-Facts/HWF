# HWF - Hardware Farmer

## Getting Started

### Requirments

  * [Mongodb](https://github.com/PappaArty/HWF/blob/main/server/src/db/readme.md)
  * [NodeJs v14.0 or higher + npm](https://nodejs.org/en/download/package-manager/)
  * [GoLang](https://go.dev/doc/install)
  * [Python](https://github.com/PappaArty/HWF/blob/main/python_api/README.md)
  * [React](https://reactjs.org/docs/create-a-new-react-app.html)
  
### Quick install guide

  * Make sure you have installed all requirements above
  * Run `npm install` in the project root directory
  * Run `python3 -m venv env` to create your virtual environemnt. 
  * Then activate tne environment with `source env/bin/activate`
  * Now install the required python modules with `pip install -r requirements.txt`
  * Run `go mod tidy` in the "daemon" directory as well as its "Message" sub-directory.
  
### Start guide

  * Run `chmod +x lazystart.py` in project's root directory
  * Then run `python3 lazystart.py`
  
### Docker start guide

  * Install `docker` and `docker-compose`

  * First open `docker-compose.yml` and edit the ip adresses in the environment variables to the ones you need (Get your private ip with `hostname -I` or `ifconfig`).
  * Run `docker-compose build --no-cache` in the project's root directory to build all images.
  * Run `docker-compose up [server/database/daemon/frontend]` to start one or more containers (Don't run containers with conflicting port bindings on the same device).

## Developement info
### How we make changes 

* We think
* We make a small testtable task   
* We make a branch 

```
git checkout -b <name of the task>
```

* We play 
* We think
* We implement 
* We think
* We reimplement
* We write tests
* We run tests 
* We think
* We reimplement
* We run tests 
* We merge main branch to ours 

```
git merge origin/main
```

* We fix merge conflicts 
* We run tests 
* We think
* We fix whats broken 
* We run tests 
* We make a pull request 
* We ask a friend to taka a look at:

```
git checkout <name of the task>
``` 
* Friend checkout the branch
* Friend runs test
* Friend looks att the code 
* Friend writes some comments and tests 
* Friend breaks the code
* We think 
* We fix the code
* We merge main branch to ours 
* We fix merge conflicts 
* We run tests
* Friend writes some comments and tests
* Friend breaks the code 
* We think
* We fix the code
* We merge main branch to ours 
* We fix merge conflicts 
* We run tests
* Friend cant breaks the code 
* Friend approves pull request  
* We celebrate 



### How to install python requirements
* Open CLI and cd into our root directory "HWF"
* Enter the command "source env/bin/activate" in the CLI
* Enter the command "pip install -r requirements" in the CLI

### How to update schemas
Schemas to be updated:
* go (/daemon/Message/) 
* python (/python_api/)
* nodejs (/server/src/)

By using:
* `flatc --go HWFmessage.fbs` in HWF/daemon/
* `flatc --p message.fbs` in HWF/python_api/
* `flatc --ts message.fbs` in HWF/server/src
*  Add this line to the generated flatc file: 

`import * as flatbuffers from 'flatbuffers'`

