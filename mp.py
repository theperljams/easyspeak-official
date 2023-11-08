#!/usr/bin/env python3
import signal
from time import sleep
import multiprocessing as mp
from Transcriber import Transcriber
from Recorder import Recorder
import uvicorn
import api


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
        
        
def mp_recorder_thread(audio_queue):
   
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    recorder = Recorder(4)
    while True: 
        try:
            wav_data = recorder.record()
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