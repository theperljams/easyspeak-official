#!/usr/bin/env python3
import atexit
import platform
import signal
import io
from time import sleep
import multiprocessing as mp
from Transcriber import Transcriber
from Recorder import Recorder
import speech_recognition as sr
import uvicorn
import api

"""
Multiprocessing code example
"""


def record_callback(_, audio: sr.AudioData) -> None:
    """
    Threaded callback function to receive audio data when recordings finish.
    audio: An AudioData containing the recorded bytes.
    """
    print("record callback")
    # Grab the raw bytes and push it into the thread-safe queue.
    data = audio.get_raw_data()
    audio_queue.put(data)
    print("Data added to queue")


class SignalCatcher:
    """
    Class to handle graceful exit of the process by catching SIGINT and SIGTERM signals,
    and setting a flag to exit the process.
    """

    def __init__(self):
        signal.signal(signal.SIGINT, self.process_signal)
        signal.signal(signal.SIGTERM, self.process_signal)
        signal.signal(signal.SIGHUP, self.process_signal)
        self.killed = False
        
    def process_signal(self, signum, frame):
        print(f"Caught {signal.strsignal(signum)} signal")
        self.killed = True

    def is_killed(self):
        return self.killed


def mp_transcribe_thread(audio_queue, text_queue):
    
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    transcriber = Transcriber("tiny")

    while True:
        try:
            if audio_queue.empty():
                print("Queue is empty")
                sleep(2)
            audio_data = audio_queue.get()
            transcription = transcriber.transcribe(curr_data=audio_data)
            text_queue.put(transcription)
            print("text added to queue: ", text_queue.qsize())
        except BaseException as e:
            s = {'failure': str(e)}
            print(s)
            continue
        


# def mp_textprocessor_thread(tq, cq, config):
#     """
#     Function to run in text threads sending messages back to rabbitMQ

#     :param tq: incoming text queue
#     :param cq: outgoing completion queue
#     :return:
#     """
#     signal.signal(signal.SIGINT, signal.SIG_IGN)
#     signal.signal(signal.SIGTERM, signal.SIG_IGN)
#     signal.signal(signal.SIGHUP, signal.SIG_IGN)
#     #TODO: setup rabbitMQ connection
#     while True:
#         try:
#             if not config['text_queue'].empty():

#         except BaseException as e:
#             s = {'failure': 'mp_reply_thread() failed', 'error': e}
#             print(s)

def setup_microphone(recorder: sr.Recognizer):
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
                        return source
        else:
            source = sr.Microphone(sample_rate=16000)
            return source
        
def mp_recorder_thread(audio_queue):
   
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    recorder = sr.Recognizer()
    source = setup_microphone(recorder)
    record_timeout = 4
    while True: 
        try:
            with source:
                recorder.adjust_for_ambient_noise(source)
                data = recorder.listen(source, phrase_time_limit=record_timeout)
                print("audio data recorded")
                wav = data.get_wav_data()
                print("calling get_wav_data()")
                wav_data = io.BytesIO(wav)
                print("wav data recorded")
            print("converted audio and wav data")
            audio_queue.put(wav_data)
        except BaseException as e:
            s = {'failure':'mp_recorder_thread() failed', 'error': e}
            print(s)

def mp_server_thread(tq):
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    cool_app = api.cool_app
    cool_app.text_queue = tq
    uvicorn.run(cool_app, host='127.0.0.1', port=8000, ws='websockets')

# def stop_uv_server():
#     # This function is called when the main process exits
#     print("Stopping the Uvicorn server")
#     uvicorn.stop()
    

def run_threads(config):
    """
    Actually run the threads and set up queues

    :return:
    """

    sc = SignalCatcher()



    aq = config['audio_queue']  
    tq = config['text_queue']   
    # cq = mp.Queue()    # completion queue

    rp = mp.Process(target=mp_recorder_thread, name="mp_recorder_thread", args=(aq,))
    rp.start()
    ap = mp.Process(target=mp_transcribe_thread, name="mp_transcribe_thread", args=(aq, tq,))
    ap.start()
    cp = mp.Process(target=mp_server_thread, name="mp_server_thread", args=(tq,))
    cp.start()

    while not sc.killed:
        sleep(1)
        print("Queues: ", aq.qsize(), tq.qsize())

    print("Killing processes")
    rp.kill()
    ap.kill()
    cp.kill()
    print("Processes killed")


if __name__ == "__main__":
    audio_queue = mp.Queue()
    text_queue = mp.Queue()
    config = {
        'audio_queue': audio_queue,
        'text_queue': text_queue,
    }
    run_threads(config)