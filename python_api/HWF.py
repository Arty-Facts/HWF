class CreateTask:
    def __init__(self, *actions):
        stages = []
        artifacts = []
        for action in actions:
            if isinstance(action, Stage):
                stages.append(action)
            elif isinstance(action, Artifacts):
                artifacts.append(action)
            else:
                raise RuntimeError(f"{type(action)} is not supported!")

class Stage:
    def __init__(self,
                 name = None,
                 data = None,
                 cmd = None,
                 timeit = True,
                 ram_usage = True,
                 comment="" ):
        pass

class Artifacts:
    def __init__(self, *files):
        self.files_to_get = files

class Result:
    pass

class Hub:
    def __init__(self, ip_address=None):
        self.ip_address = ip_address
        self.conected = False

    def __enter__(self):
        pass

    def __exit__(self ,type, value, traceback):
        pass

    def connect(self):
        pass

    def dissconect(self):
        pass

    def get(self, *hardware):
        pass
    
    def get_jobs(self, job_ids, wait=True):
        pass

    def get_hardware_pool(self):
        pass

    def dispatch_async(self, hardware=None, exec=None, priority=0):
        pass

    def dispatch(self, hardware=None, exec=None, priority=0):
        pass