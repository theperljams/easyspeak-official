#!/usr/bin/env python3

from fastapi import FastAPI, Depends
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
from datetime import datetime, timedelta
from queue import Queue
from tempfile import NamedTemporaryFile
from time import sleep
from sys import platform

import mp
import multiprocessing as multi_process

SOURCE = None
RECORDER = sr.Recognizer()
DATA_QUEUE = Queue()
AUDIO_MODEL = None

text_queue = multi_process.Queue()

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

cool_app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

cool_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@cool_app.post("/query")
async def query_chain(question: Question):
    print(f"Question: {question}")
    query = f"{question.question}"
    result = qa.run(query=query, verbose=False)
    if result[0] == '\n':
        result = result[1:]
    return result

async def print_and_return_alphabet():
    alphabet = ''
    for letter in range(ord('a'), ord('z')+1):
        alphabet += chr(letter)
        print(chr(letter), end=' ')
    
    return alphabet


@cool_app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):

    print("text_queue: ", text_queue)
    if not text_queue.empty():
        await websocket.accept()
        while not text_queue.empty():
            transcription = text_queue.get()
            if transcription != '':
                await websocket.send_text(transcription)
            else:
                continue
    else:
        await websocket.accept()
        await websocket.send_text("Waiting for transcription...")
        print("Transcribing...")

if __name__ == '__main__':
    audio_queue = multi_process.Queue()
    config = {
        'audio_queue': audio_queue,
        'text_queue': text_queue,
    }
    mp.run_threads(config)
   

