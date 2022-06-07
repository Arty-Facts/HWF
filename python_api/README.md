## Install python

* [Make sure python is installed.](https://www.python.org/downloads/)

## To prepare an environment for your api

1. Navigate to the project's root directory
2. First run `python3 -m venv env` to create the environemnt
3. Then activate tne environment with `source env/bin/activate`
4. Now install the required python modules with `pip install -r requirements.txt`

## To run the test api
* Run this command in the pythn_api directory while in the python environment:

  `python testapi2.py`

## API usage, classes and functions
All of the following classes and functions are defined in `HWF.py`. These are what you will use to create tasks, send them to their correct destination, and retrieve various information from the hub. This is not an exhaustive list of all classes and functions in HWF.py, but only the ones you should need to make use of.

### dispatch()
should be await'ed

### Hub()
This class is what will be used to create a websocket connection to a hub, and to then send or retrieve information to/from it. 

**Attributes (only relevant ones listed)**:
* ip_address (string):  

**Functions (only relevant ones listed)**:

###  Hub.get_result(job_ids, wait)
Retrieve the results for some job ID(s) from the hub. Should be await'ed

**Arguments**:
* Job_ids(string or list of strings): a task-ID or list of task-IDs (returned from from `dispatch()`) for which the hub should send back the results of.
* Wait (bool): **Not yet implemented**. If a requested task is not yet completed then the program will wait until that task is done and the result is returned.

**Returns:** A `ResultList()` object

### Hub.get_hardware_pool(*hardware)
**Arguments:** should be await'ed

**Returns:**
### Task( *actions [Stage() or Artifacts()], hardware)
The main Task class that is to be sent to the hub.

**Attributes**:
* Stages (`Stage()`): Object(s) of the type `Stage()`
* Artifacts (`Artifact()`): Object(s) of the type `Artifacts()`
* Hardware (dict): `{"os": string, "cpu": string, "gpu": string, "ram": string}`. A dict containing the hardware the task is intended to run on.
If you do not want to specify a certain hardware type then you can instead put "any" as the dict value.

### Stage(name, data, cmd, track_time, track_ram, track_cpu, track_gpu, comment)
Part of a task. A stage contains commands (for the terminal or windows command prompt)to be executed and, if necessary, data that will be saved by the chosen daemon before execution. Also determines what type of information will be tracked during execution.

**Attributes**:
* Name (string): The name of the stage.
* Data (`Data()`): Object of the type `Data()`.
* Cmd (string or list of strings): A command or list of commands.
* Track_time (bool): Wether or not the daemon should track how long the task and its commands takes to execute.
* Track_ram (bool): **Not yet implemented.**
* Track_cpu (bool): **Not yet implemented.**
* Track_gpu (bool): **Not yet implemented.**
* Comment (string): An optional comment about this stage.

### Artifacts(*files)
Artifacts are files that will be sent back from the daemon when it is finished executing all stages in a task. Since this class only contains a filename the matching file will have to be created by the task's commands or already be present on the machine executing them.

**Attribute**:
* File (string): The name of the file(s) that should be returned.

### Data(path, filename)
Tells the programs where to get any additional data that should be sent together with the task.

**Attributes**:
* Path (string): The path to the file that will be sent.
* Filename (string): The name (including file extension) that the file will be saved with on the executing machine.



### TaskResult()

### StageResult()

### CommandResult()

### HardwarePool


