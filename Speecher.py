
# From https://github.com/rhasspy/piper/blob/master/src/python_run/piper/__main__.py

from piper import PiperVoice
from piper.download import get_voices, ensure_voice_exists, find_voice
import os
import io
import numpy as np
from typing import Any, Dict
import sounddevice as sd
import wave
import json


class Speecher:

    def __init__(self, model="en_US-amy-medium", use_cuda=False, play_audio=True, download_dir="./models/piper"):
        self.model = model
        self.config = None
        self.sample_rate = None
        self.play_audio = play_audio
        self.use_cuda = use_cuda
        self.download_dir = download_dir
        self.voice = None
        self.download_model()
        self.get_samplerate()
        self.load_model()

    def download_model(self):
        '''
        Does the actual downloading of the model files from hugging face, if necessary.
        '''
        if not os.path.exists(self.download_dir):
            os.makedirs(self.download_dir)
        model_path = os.path.join(self.download_dir, self.model)
        if not os.path.exists(model_path):
            voices_info = get_voices(self.download_dir)
            # something about legacy
            aliases_info: Dict[str, Any] = {}
            for voice_info in voices_info.values():
                for voice_alias in voice_info.get("aliases", []):
                    aliases_info[voice_alias] = {"_is_alias": True, **voice_info}
            voices_info.update(aliases_info)
            # download models
            ensure_voice_exists(self.model, [self.download_dir], self.download_dir, voices_info)
        self.model, self.config = find_voice(self.model, [self.download_dir])

    def get_samplerate(self):
        with open(self.config) as f:
            rawconfig = f.read()
        config = json.loads(rawconfig)
        self.sample_rate = config["audio"]["sample_rate"]

    def load_model(self):
        '''
        Loads the model into memory.
        '''
        self.voice = PiperVoice.load(self.model, use_cuda=self.use_cuda)

    def synthesize_to_file(self, txt, filepath):
        '''
        Including this to show the simple path.
        '''
        with wave.open(filepath, "wb") as wav_file:
            self.voice.synthesize(txt, wav_file)

    def synthesize(self, txt):
        '''
        Synthesize speech from text. Optionally play audio.
        Returns a wav file buffer.
        '''
        # prep a wav file buffer
        output = io.BytesIO()
        wave_file = wave.open(output, "wb")
        wave_file.setnchannels(1)
        wave_file.setsampwidth(2)
        wave_file.setframerate(self.sample_rate)

        # synthesize speech
        audio_stream = self.voice.synthesize_stream_raw(txt)
        for audio_bytes in audio_stream:
            c = np.frombuffer(audio_bytes, dtype=np.int16)
            # optionally play audio
            if self.play_audio:
                sd.play(c, samplerate=self.sample_rate)
                sd.wait()
            # write data to wav file
            wave_file.writeframes(audio_bytes)
        wave_file.close()
        boutput = output.getvalue()
        output.close()
        return boutput


if __name__ == "__main__":
    # test
    import time

    txt = "hello my name is indigo montoya, you killed my father, prepare to die"
    print(txt)

    st = time.time()
    s = Speecher()
    print(time.time() - st)
    st = time.time()
    # time each step
    s.synthesize_to_file(txt, "test.wav")
    print(time.time() - st)
    st = time.time()
    with open("test3.wav", "wb") as f:
        a = s.synthesize(txt)
        f.write(a)
    print(time.time() - st)
    st = time.time()
