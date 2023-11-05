#!/usr/bin/env python3
import platform
import signal
from time import sleep
import multiprocessing as mp
from Transcriber import Transcriber
from Recorder import Recorder
import speech_recognition as sr

"""
Multiprocessing code example
"""


class SignalCatcher:
    """
    Class to handle graceful exit of the process by catching SIGINT and SIGTERM signals,
    and setting a flag to exit the process.
    """
    killed = False

    def __init__(self):
        signal.signal(signal.SIGINT, self.process_signal)
        signal.signal(signal.SIGTERM, self.process_signal)
        signal.signal(signal.SIGHUP, self.process_signal)

    def process_signal(self, signum, frame):
        print(f"Caught {signal.strsignal(signum)} signal")
        self.killed = True


def mp_transcribe_thread(config):
    """
    Function that is feed audio data and outputs transcription results.

    :param aq: incoming audio queue
    :param tq: outgoing text queue
    :return:
    """
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    transcriber = Transcriber(config)
    transcriber.load_model()

    while True:
        try:
            if config['audio_queue'].empty():
                # print("no data")
                continue
            else: 
                while not config['audio_queue'].empty():
                    print("There's data!")
                    audio_data = config['audio_queue'].get()
                    transcription = transcriber.transcribe(curr_data=audio_data)
            for transcript in transcription:
                config['text_queue'].put(transcript)
        except BaseException as e:
            s = {'failure': str(e)}
            print(s)
            continue
        sleep(0.25)


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
        
def mp_recorder_thread(config):
    """
    Function to run in recieve threads listening for rabbitMQ messages
    :param aq: outgoing action queue
    """
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    recorder = sr.Recognizer()
    source = setup_microphone(recorder)
    record_timeout = 2

    def record_callback(_, audio: sr.AudioData) -> None:
            """
            Threaded callback function to receive audio data when recordings finish.
            audio: An AudioData containing the recorded bytes.
            """
            # Grab the raw bytes and push it into the thread-safe queue.
            data = audio.get_raw_data()
            config["audio_queue"].put(data)
            print("Data added to queue")
    try:
        with source:
            recorder.adjust_for_ambient_noise(source)
        recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)
        print("Listening for audio")
    except BaseException as e:
            s = {'failure':'mp_recorder_thread() failed', 'error': e}
            print(s)
    
        


def run_threads(config):
    """
    Actually run the threads and set up queues

    :return:
    """

    sc = SignalCatcher()

    # aq = mp.Queue()    # action queue
    # rq = mp.Queue()    # reply queue
    # cq = mp.Queue()    # completion queue

    rp = mp.Process(target=mp_recorder_thread, name="mp_recorder_thread", args=(config,))
    rp.start()
    ap = mp.Process(target=mp_transcribe_thread, name="mp_transcribe_thread", args=(config,))
    ap.start()
    # cp = mp.Process(target=mp_reply_thread, name="mp_reply_thread", args=(rq, cq, config,))
    # cp.start()

    i = 0
    while not sc.killed:
        try:
            c = config["text_queue"].get(timeout=300)
            print(c)
            print()
            i += 1
        except mp.queues.Empty:
            print("timed out waiting for completion, retrying")
            pass

    rp.kill()
    ap.kill()
    # cp.kill()


if __name__ == "__main__":
    config = {
        'audio_queue': mp.Queue(),
        'text_queue': mp.Queue(),
        'source': None,
        'model': 'tiny'
    }
    run_threads(config)
