import whisper
import io
import torch
from datetime import datetime, timedelta
from tempfile import NamedTemporaryFile
from time import sleep

class Transcriber:
    def __init__(self, config: dict):
        self.audio_model = None
        self.source = config['source']
        self.model = config['model']


    def load_model(self):
        # Load / Download model
        non_english = False
        if self.model != "large" and not non_english:
            self.model = self.model + ".en"
        self.audio_model = whisper.load_model(self.model)
        print("Model loaded")

    def transcribe(self, curr_data: bytes):

        if (self.audio_model is None):
            self.load_model()

    
        phrase_timeout = 3
        last_sample = bytes()
        temp_file = NamedTemporaryFile().name
        phrase_time = None
        transcription = ['']

        now = datetime.utcnow()
        # Pull raw recorded audio from the queue.
        if not curr_data is None:
            print("has data")
            phrase_complete = False
            # If enough time has passed between recordings, consider the phrase complete.
            # Clear the current working audio buffer to start over with the new data.
            if phrase_time and now - phrase_time > timedelta(seconds=phrase_timeout):
                last_sample = bytes()
                phrase_complete = True
            # This is the last time we received new audio data from the queue.
            phrase_time = now

            # Use AudioData to convert the raw data to wav data.
            audio_data = whisper.AudioData(last_sample, self.source.SAMPLE_RATE, self.source.SAMPLE_WIDTH)
            wav_data = io.BytesIO(audio_data.get_wav_data())
            print("converted audio and wav data")

            # Write wav data to the temporary file as bytes.
            with open(temp_file, 'wb') as f:
                f.write(wav_data.read())

            print("made temp file")
            # Read the transcription.
            result = self.audio_model.transcribe(temp_file, fp16=torch.cuda.is_available())
            text = result['text'].strip()
            print("Made text: ", text)

            # If we detected a pause between recordings, add a new item to our transcription.
            # Otherwise edit the existing one.
            if phrase_complete:
                transcription.append(text)
                return transcription
            else:
                transcription[-1] = text

