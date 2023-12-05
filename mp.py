#!/usr/bin/env python3

import signal
from time import sleep
import os
import io
import sys
import multiprocessing as mp
from Transcriber import Transcriber
from Recorder import Recorder
from Speecher import Speecher
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

cool_app = api.cool_app
# cool_app.is_listening = False

def mp_transcribe_thread(config, audio_queue, text_queue, threaded=True):
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    transcriber = Transcriber(config['whispermodel'])

    while True:
        try:
            if audio_queue.empty():
                print("Queue is empty")
                sleep(2)
            audio_data = audio_queue.get()
            audio_data = io.BytesIO(audio_data)
            transcription = transcriber.transcribe(curr_data=audio_data)
            text_queue.put(transcription)
            print("text added to queue: ", text_queue.qsize())
        except BaseException as e:
            s = {'failure':'mp_transcribe_thread() failed', 'error': e}
            print(s)
            continue
        # for testing ends loop
        if not threaded:
            break


def mp_recorder_thread(config, audio_queue, threaded=True):
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
        # for testing ends loop
        if not threaded:
            break


def mp_speech_thread(config, generated_queue, speech_queue, threaded=True):
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    download_dir = os.path.join(config['models_dir'], 'piper')
    speecher = Speecher(model=config['ttsmodel'],
                        use_cuda=config['use_cuda'],
                        play_audio=config['play_audio'],
                        download_dir=download_dir)

    while True:
        try:
            txt = generated_queue.get()
            wav_data = speecher.synthesize(txt)
            # we have the wav data, but we don't want to send it to the client yet
            speech_queue.put(wav_data)
        except BaseException as e:
            s = {'failure':'mp_speech_thread() failed', 'error': e}
            print(s)
        # for testing ends loop
        if not threaded:
            break

def mp_server_thread(config, text_queue, speech_queue, generated_queue):
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    cool_app = api.cool_app
    cool_app.text_queue = text_queue
    cool_app.speech_queue = speech_queue
    cool_app.generated_queue = generated_queue
    uvicorn.run(cool_app, host='0.0.0.0', port=8000, ws='websockets')

def run_threads(queues, config):
    """
    Actually run the threads and set up queues

    :return:
    """

    sc = SignalCatcher()

    aq = queues['audio_queue']
    tq = queues['text_queue']
    gq = queues['generated_queue']
    sq = queues['speech_queue']
    # cq = mp.Queue()    # completion queue
    
    rp = mp.Process(target=mp_recorder_thread, name="mp_recorder_thread", args=(config, aq,))
    rp.start()
    tp = mp.Process(target=mp_transcribe_thread, name="mp_transcribe_thread", args=(config, aq, tq,))
    tp.start()
    spchp = mp.Process(target=mp_speech_thread, name="mp_speech_thread", args=(config, gq, sq,))
    spchp.start()
    srvrp = mp.Process(target=mp_server_thread, name="mp_server_thread", args=(config, tq, sq, gq,))
    srvrp.start()

    while not sc.killed:
        sleep(1)
        # print("Queues: ", aq.qsize(), tq.qsize())

    print("Killing processes")
    rp.kill()
    tp.kill()
    spchp.kill()
    srvrp.kill()
    print("Processes killed")


def selftest(queues, config):
    '''
    Run a unthreaded test of some of the functions
    '''
    with open('tests/indigo.wav', 'rb') as f:
        queues['audio_queue'].put(f.read())
    mp_transcribe_thread(config, queues['audio_queue'], queues['text_queue'], threaded=False)
    t = queues['text_queue'].get()
    print(t)
    queues['generated_queue'].put(t)
    mp_speech_thread(config, queues['generated_queue'], queues['speech_queue'], threaded=False)
    if not queues['speech_queue'].empty():
        wav_data = queues['speech_queue'].get()
        with open('tests/output.wav', 'wb') as f:
            f.write(wav_data)


if __name__ == "__main__":
    import torch
    import argparse

    parser = argparse.ArgumentParser()
    # example of how to add an argument
    parser.add_argument("--ttsmodel", default="en_US-amy-medium", help="Piper TTS model")
    parser.add_argument("--whispermodel", default="tiny", help="Whisper STT model")
    parser.add_argument("--models_dir", default="./models/", help="Directory to download models")
    parser.add_argument("--use_cuda", default=False, help="Use CUDA")
    parser.add_argument("--play_audio", default=True, help="Play audio")
    ## make selftest store on true
    parser.add_argument("--selftest", action="store_true", help="Run selftest")
    args = parser.parse_args()

    # hack to get around multiprocessing not working with torch
    torch.multiprocessing.set_start_method('spawn')
    audio_queue = mp.Queue()
    text_queue = mp.Queue()
    generated_queue = mp.Queue()
    speech_queue = mp.Queue()
    queues = {
        'audio_queue': audio_queue,
        'text_queue': text_queue,
        'generated_queue': generated_queue,
        'speech_queue': speech_queue,
    }
    config = {
        'ttsmodel': args.ttsmodel,
        'whispermodel': args.whispermodel,
        'models_dir': args.models_dir,
        'use_cuda': args.use_cuda,
        'play_audio': args.play_audio,
    }
    if args.selftest:
        selftest(queues, config)
        sys.exit(0)

    run_threads(queues, config)