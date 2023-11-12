#!/usr/bin/env python3
import signal
from time import sleep
import multiprocessing as mp


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


def mp_action_thread(aq, rq, config):
    """
    Function to run in action threads to do work with Docker

    :param aq: incoming action queue
    :param rq: outgoing reply queue
    :return:
    """
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    while True:
        indata = None
        outdata = None
        try:
            # get work message from incoming queue
            indata = aq.get()

            # TODO: do work based on message from queue
            print(f"mp_action_thread(): indata={indata} config={config}")

            # put results on outgoing queue for reply to rabbitMQ
            outdata = {'exitcode': 0, 'otherdata': 'put message stuff in this dict'}
            rq.put(outdata)
        except BaseException as e:
            s = {'failure': 'mp_action_thread() failed', 'error': e}
            print(s)


def mp_reply_thread(rq, cq, config):
    """
    Function to run in reply threads sending messages back to rabbitMQ

    :param rq: incoming reply queue
    :param cq: outgoing completion queue
    :return:
    """
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    #TODO: setup rabbitMQ connection
    while True:
        indata = None
        outdata = None
        try:
            # get reply message from incoming queue
            indata = rq.get()

            # TODO: send message to rabbitMQ
            print(f"mp_reply_thread(): indata={indata} config={config}")

            # put results on outgoing queue to confirm completion
            # really just here in case we want to track how many actions we've completed through the whole process
            outdata = {'exitcode': 0}
            cq.put(outdata)
        except BaseException as e:
            s = {'failure': 'mp_reply_thread() failed', 'error': e}
            print(s)


def mp_reciever_thread(aq, config):
    """
    Function to run in recieve threads listening for rabbitMQ messages
    :param aq: outgoing action queue
    """
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    #TODO: setup rabbitMQ connection

    # invoke rabbitMQ consumer

    # Just here to simulate messages coming in from rabbitMQ
    i = 0
    while True:
        print(f"mp_reciever_thread(): i={i}")
        outdata = {'exitcode': 0, 'i': i}
        i += 1
        aq.put(outdata)
        sleep(3)


def run_threads(config):
    """
    Actually run the threads and set up queues

    :return:
    """

    sc = SignalCatcher()

    aq = mp.Queue()    # action queue
    rq = mp.Queue()    # reply queue
    cq = mp.Queue()    # completion queue

    rp = mp.Process(target=mp_reciever_thread, name="mp_reciever_thread", args=(aq, config,))
    rp.start()
    ap = mp.Process(target=mp_action_thread, name="mp_action_thread", args=(aq, rq, config,))
    ap.start()
    cp = mp.Process(target=mp_reply_thread, name="mp_reply_thread", args=(rq, cq, config,))
    cp.start()

    i = 0
    while not sc.killed:
        try:
            c = cq.get(timeout=4)
            print(f"done: c={c} i={i}")
            print()
            i += 1
        except mp.queues.Empty:
            print("timed out waiting for completion, retrying")
            pass

    rp.kill()
    ap.kill()
    cp.kill()


if __name__ == "__main__":
    config = {'config': 'stuff'}
    run_threads(config)
