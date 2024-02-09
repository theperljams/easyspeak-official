import io
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

        try:
            if isinstance(curr_data, io.BytesIO):
                # If curr_data is a BytesIO object, extract bytes.
                curr_data.seek(0)  # Reset the pointer to the beginning of the BytesIO object
                data_bytes = curr_data.read()
            elif isinstance(curr_data, bytes):
                # If curr_data is already bytes, use it directly.
                data_bytes = curr_data
            else:
                raise TypeError("Invalid data type. Expected bytes or BytesIO object.")

            # Create a temporary file and write wav data to it as bytes.
            with NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(data_bytes)

            # Read the transcription.
            result = self.audio_model.transcribe(temp_file.name, fp16=torch.cuda.is_available())
            os.remove(temp_file.name)
            text = result['text'].strip()
            print("Made text:", text)
            return text

        except Exception as e:
            # Handle exceptions or specific errors here.
            print("Error occurred:", e)
            return None  # Or handle the error according to your requirement.

