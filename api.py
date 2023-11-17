#!/usr/bin/env python3

from fastapi import FastAPI
from pydantic import BaseModel
import dotenv

import langchain
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate

import os
from fastapi import WebSocket, WebSocketDisconnect
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav
import io

os.environ["SUNO_OFFLOAD_CPU"] = "True"
os.environ["SUNO_USE_SMALL_MODELS"] = "True"

dotenv.load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

loader = DirectoryLoader('data', glob="**/*.txt")
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=2500, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

docsearch = Chroma.from_documents(texts, embeddings)

template = """"You are Danny from the context given. Mimic his voice and way of speaking, try to be as convincing as possible. Use the context below to answer questions. Stay in character while answering questions. DO NOT refer to yourself in the third person. If you don't know the answer to something, just say that you don't know.

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
from transformers import pipeline
import scipy

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

@cool_app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            text = ""
            while not cool_app.text_queue.empty():
                part = cool_app.text_queue.get()
                text += " " + part
                print(f"[WEB]:\t Got {part}")
            if text:
                print(f"[WEB]:\t Sending: {text}")
                await websocket.send_text(text.strip())
                await websocket.receive()
    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()
    
           
@cool_app.post("/speak")
async def audio(response: Question):
    synthesiser = pipeline("text-to-speech", "suno/bark-small")
    print("Response: ", response.question)
    speech = synthesiser(response.question, forward_params={"do_sample": True})

    wav_bytes_io = io.BytesIO()
    scipy.io.wavfile.write("bark_out.wav", rate=speech["sampling_rate"], data=speech["audio"])
    wav_bytes = wav_bytes_io.getvalue()
    print("Wav bytes: ", wav_bytes)
    wav_bytes_io.close()
    return wav_bytes
