import speech_recognition as sr
import platform
import io

class Recorder:
    def __init__(self, record_timeout):
        self.record_timeout = record_timeout
        self.recorder = sr.Recognizer()
        self.setup_microphone(self.recorder)


    def setup_microphone(self, recorder: sr.Recognizer):
        recorder.energy_threshold = 1000
        # Definitely do this, dynamic energy compensation lowers the energy threshold dramatically to a point where the SpeechRecognizer never stops recording.
        recorder.dynamic_energy_threshold = False

        # Important for Linux users.
        if 'linux' in platform.system().lower():
            mic_name = 'pulse'
            print(mic_name)
            if not mic_name or mic_name == 'list':
                print("Available microphone devices are: ")
                for index, name in enumerate(sr.Microphone.list_microphone_names()):
                    print(f"Microphone with name \"{name}\" found")
                return
            else:
                for index, name in enumerate(sr.Microphone.list_microphone_names()):
                    if mic_name in name:
                        source = sr.Microphone(sample_rate=16000, device_index=index)
                        print("Source: ", source)
                        print(name)
                        self.source = source
        else:
            source = sr.Microphone(sample_rate=16000)
            self.source = source
        
    def record(self):
        with self.source:
            self.recorder.adjust_for_ambient_noise(self.source)
            data = self.recorder.listen(self.source, phrase_time_limit=self.record_timeout)
            print("audio data recorded")
            wav = data.get_wav_data()
            print("calling get_wav_data()")
            wav_data = io.BytesIO(wav)
        print("wav data recorded")
        print("converted audio and wav data")
        # converts the file like object to bytes
        output = wav_data.getvalue()
        wav_data.close()
        return output
