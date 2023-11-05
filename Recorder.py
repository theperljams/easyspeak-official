import speech_recognition as sr
import platform

class Recorder:
    def __init__(self, config: dict):
        self.record_timeout = 2
        self.recorder = sr.Recognizer()
        self.source = config["source"]

    def get_record(self):
        return self.recorder

    
