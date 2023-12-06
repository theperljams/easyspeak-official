import whisper
import torch
from tempfile import NamedTemporaryFile
import os

class Transcriber:
    def __init__(self, model):
        self.model = model
        self.audio_model = None
        self.load_model()


    def load_model(self):
        if self.audio_model is not None:
            return
        # Load / Download model
        non_english = False
        if self.model != "large" and not non_english:
            self.model = self.model + ".en"
        self.audio_model = whisper.load_model(self.model)
        print("Model loaded")

    def transcribe(self, curr_data: bytes):

        if (self.audio_model is None):
            self.load_model()

    
        temp_file = NamedTemporaryFile().name

        # Write wav data to the temporary file as bytes.
        with open(temp_file, 'wb') as f:
            f.write(curr_data.read())

        print("made temp file")
        # Read the transcription.
        result = self.audio_model.transcribe(temp_file, fp16=torch.cuda.is_available())
        os.remove(temp_file)
        text = result['text'].strip()
        print("Made text: ", text)
        return text
    
        # else:
        #     transcription[-1] = text

