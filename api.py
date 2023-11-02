#!/usr/bin/env python3

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import dotenv
import langchain
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain.agents.openai_functions_agent.agent_token_buffer_memory import AgentTokenBufferMemory
from langchain.agents.openai_functions_agent.base import OpenAIFunctionsAgent
from langchain.schema.messages import SystemMessage
from langchain.prompts import MessagesPlaceholder
from langchain.agents import AgentExecutor
from langchain import PromptTemplate

import io
import os
import speech_recognition as sr
import whisper
import torch
from fastapi import WebSocket
import asyncio
import websockets
from starlette.types import Message


from datetime import datetime, timedelta
from queue import Queue
from tempfile import NamedTemporaryFile
from time import sleep
from sys import platform

dotenv.load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

loader = DirectoryLoader('data', glob="**/*.txt")
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=2500, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

docsearch = Chroma.from_documents(texts, embeddings)

template = """"You are Ron Swanson. Mimic his voice and way of speaking, try to be as convincing as possible. Use the context below to answer questions. Stay in character while answering questions. DO NOT refer to yourself in the third person. If you don't know the answer to something, just say that you don't know.

{context}

Question: {question}
Answer: """

PROMPT = PromptTemplate(template=template, input_variables=["context", "question"])

langchain.verbose = True
qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
    chain_type_kwargs={"prompt": PROMPT}
 )



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/query")
async def query_chain(question: Question):
    print(f"Question: {question}")
    query = f"{question.question}"
    result = qa.run(query=query, verbose=False)
    if result[0] == '\n':
        result = result[1:]
    return result

async def send_transcription(websocket, transcription):
    for transcript in transcription:
        if(transcript != ''):
            await websocket.send_text(transcript)
        else:
            continue



@app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):

    await websocket.accept()

    # The last time a recording was retrieved from the queue.
    phrase_time = None
    # Current raw audio bytes.
    last_sample = bytes()
    # Thread safe Queue for passing data from the threaded recording callback.
    data_queue = Queue()
    # We use SpeechRecognizer to record our audio because it has a nice feature where it can detect when speech ends.
    recorder = sr.Recognizer()
    recorder.energy_threshold = 1000
    # Definitely do this, dynamic energy compensation lowers the energy threshold dramatically to a point where the SpeechRecognizer never stops recording.
    recorder.dynamic_energy_threshold = False

    # Important for linux users.
    # Prevents permanent application hang and crash by using the wrong Microphone
    if 'linux' in platform:
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
                    print("Source: " , source)
                    print(name)
                    break
    else:
        source = sr.Microphone(sample_rate=16000)

    # Load / Download model
    model = "tiny"
    non_english = False
    if model != "large" and not non_english:
        model = model + ".en"
    audio_model = whisper.load_model(model)
    
    print("Model loaded")

    record_timeout = 2
    phrase_timeout = 3

    temp_file = NamedTemporaryFile().name
    transcription = ['']

    with source:
        print(source)
        recorder.adjust_for_ambient_noise(source)

    def record_callback(_, audio:sr.AudioData) -> None:
        """
        Threaded callback function to receive audio data when recordings finish.
        audio: An AudioData containing the recorded bytes.
        """
        # Grab the raw bytes and push it into the thread safe queue.
        data = audio.get_raw_data()
        data_queue.put(data)
        print("data added to queue")

    # Create a background thread that will pass us raw audio bytes.
    # We could do this manually but SpeechRecognizer provides a nice helper.
    recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)

    print("recorder thread started")

    while True:
        now = datetime.utcnow()
        # Pull raw recorded audio from the queue.
        if not data_queue.empty():
            print("has data")
            phrase_complete = False
            # If enough time has passed between recordings, consider the phrase complete.
            # Clear the current working audio buffer to start over with the new data.
            if phrase_time and now - phrase_time > timedelta(seconds=phrase_timeout):
                last_sample = bytes()
                phrase_complete = True
            # This is the last time we received new audio data from the queue.
            phrase_time = now

            # Concatenate our current audio data with the latest audio data.
            while not data_queue.empty():
                print("adding to last sample")
                data = data_queue.get()
                last_sample += data

            # Use AudioData to convert the raw data to wav data.
            audio_data = sr.AudioData(last_sample, source.SAMPLE_RATE, source.SAMPLE_WIDTH)
            wav_data = io.BytesIO(audio_data.get_wav_data())
            print("converted audio and wav data")

            # Write wav data to the temporary file as bytes.
            with open(temp_file, 'w+b') as f:
                f.write(wav_data.read())

            print("made temp file")
            # Read the transcription.
            result = audio_model.transcribe(temp_file, fp16=torch.cuda.is_available())
            text = result['text'].strip()
            print("Made text: ", text)

            # If we detected a pause between recordings, add a new item to our transcription.
            # Otherwise edit the existing one.
            if phrase_complete:
                transcription.append(text)
                print("Transcription: ", transcription)
                await send_transcription(websocket, transcription)
            else:
                transcription[-1] = text

            # Infinite loops are bad for processors, must sleep.
            sleep(0.25)


if __name__ == '__main__':

    uvicorn.run(app, host='127.0.0.1', port=8000, ws='websockets')

