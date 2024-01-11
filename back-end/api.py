#!/usr/bin/env python3

from fastapi import FastAPI
from pydantic import BaseModel
import dotenv

from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from MyDataLoader import MyDataLoader
from langchain.docstore.document import Document
import json

import os
from fastapi import WebSocket, WebSocketDisconnect
from transformers import AutoProcessor, BarkModel
import torch
import sounddevice as sd
import time
import numpy as np

dotenv.load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
loader = MyDataLoader('data/data_with_prefixes.csv')
documents = loader.split_by_rows()
# for doc in documents:
#     print(doc)
docs = []
for doc in documents:
    curr_doc = Document(page_content=doc, metadata={"source": "../data/danny_prefixes.csv"})
    # print(curr_doc)
    docs.append(curr_doc)

print("created docs", len(docs))

ids = [str(i) for i in range(1, len(docs) + 1)]

docsearch = Chroma.from_documents(docs, embeddings, ids=ids)

template = """"You are Danny from the context given. Mimic his voice and way of speaking, try to be as convincing as possible. Use the context below to answer questions. Answer each question as if you were Danny. 
Assume any question you are asked is a question you are answering for Danny. You = Danny. For example, if someone asks: \"What you are studying?\" think of the question as: \"What does Danny say he is studying?\"
Stay in character while answering questions. DO NOT refer to yourself in the third person. DO NOT ask how you can help. 
If you don't know the answer to something, just say that you don't know.
Come up with 4 possible responses to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts.

{context}

User: {question}
Danny:
Danny:\n
Danny:\n
Danny:"""
PROMPT = PromptTemplate(template=template, input_variables=["context", "question"])
print("created prompt")

# langchain.debug = True
retriever=docsearch.as_retriever(search_type="similarity", search_kwargs={'k': 2})
#debug
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model_name='gpt-3.5-turbo'),
    chain_type="stuff",
    retriever=retriever,
    chain_type_kwargs={"prompt": PROMPT}
 )

def has_numerical_character(text):
    return any(char.isdigit() for char in text)

def parse_numbered_list(input_string):

    if not has_numerical_character(input_string):
        return [input_string]
    # Split the input string into lines
    lines = input_string.strip().split('\n')

    # Initialize an empty array to store the items
    items = []

    # Iterate through each line and extract the item content
    for line in lines:
        # Split the line into the number and the item content
        parts = line.split('. ', 1)
        
        # Check if the line is a valid numbered item
        if len(parts) == 2 and parts[0].isdigit():
            item_content = parts[1].strip()
            
            # Append the item content to the array
            items.append(item_content)

    return items

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

cool_app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173"
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
    print(f"Result: {result}")
    result_list = parse_numbered_list(result)
    print(result_list)
    return result_list

@cool_app.websocket("/record")
async def record(websocket: WebSocket):
    try:
        await websocket.accept()
        message = websocket.receive_bytes()
        print("[WEB]:\t Received message")
        cool_app.audio_queue.put(message)
    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()
    except Exception as e:
        print(f"[WEB]:\t Error receiving data (transcriber): {e}")
        await websocket.close()

@cool_app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            text = ""
            # try:
            while not cool_app.text_queue.empty():
                part = cool_app.text_queue.get()
                text += " " + part
                print(f"[WEB]:\t Got {part}")
            if text:
                print(f"[WEB]:\t Sending: {text}")
                await websocket.send_text(text.strip())
                await websocket.receive()
            # except Exception as e:  # Catch other errors during reception
            #     print(f"[WEB]:\t Error receiving data: {e}")
            #     cool_app.text_queue = mp.Queue()
            #     break  # Exit the loop to handle the error
    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()
    except Exception as e:
        print(f"[WEB]:\t Error receiving data (transcriber): {e}")
        await websocket.close()
    

@cool_app.websocket("/speak")
async def handle_audio(websocket: WebSocket):
    await websocket.accept()

    # Receive the initial message containing the question text
    message = await websocket.receive_text()  # Use receive_text() for text messages
    question_data = json.loads(message)  # Deserialize JSON if applicable
    question_text = question_data.get("question")  # Extract the question from the parsed data
    print("[WEB]:\t Received question: ", question_text)

    # Put the question text in the queue
    cool_app.generated_queue.put(question_text)

    try:
        while True:
            audio_data = b"" 

            while not cool_app.speech_queue.empty():
                audio_part = cool_app.speech_queue.get()
                audio_data += audio_part
                print("[WEB]:\t Got audio")

            if audio_data:
                print("[WEB]:\t Sending audio")
                await websocket.send_bytes(audio_data)
                await websocket.receive()

    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()
    except Exception as e:
        print(f"[WEB]:\t Error receiving data (speak): {e}")
        await websocket.close()
    

async def audio(response: Question):
    os.environ["SUNO_OFFLOAD_CPU"] = "False"
    os.environ["SUNO_USE_SMALL_MODELS"] = "1"

    device = "cuda" if torch.cuda.is_available() else "cpu"

    modelname = "suno/bark-small"

    processor = AutoProcessor.from_pretrained(modelname)
    model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16)


    #modelname = "suno/bark"
    # model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16, use_flash_attention_2=True)
    #model = BarkModel.from_pretrained(modelname)

    model.to(device)
    voice_preset = "v2/en_speaker_7"

    # Measure the time to generate inputs
    start_time_inputs = time.time()
    inputs = processor(response.question, voice_preset=voice_preset)
    end_time_inputs = time.time()

    # Move inputs to the specified device
    inputs = {key: value.to(device) for key, value in inputs.items()}

    # Measure the time to generate audio_array
    start_time_generate = time.time()
    audio_array = model.generate(**inputs)
    end_time_generate = time.time()

    audio_array = audio_array.cpu().numpy().squeeze()
    audio_array = audio_array.astype(np.float64)

    sample_rate = model.generation_config.sample_rate

    # Print timing information
    print("Time to generate inputs:", end_time_inputs - start_time_inputs, "seconds")
    print("Time to generate audio_array:", end_time_generate - start_time_generate, "seconds")

    print(audio_array.shape)
    print(audio_array.dtype)
    print(sample_rate)

    sd.play(audio_array, sample_rate)
    status = sd.wait()
     
           
# @cool_app.post("/speak")
# async def audio(response: Question):
#     synthesiser = pipeline("text-to-speech", "suno/bark-small")
#     print("Response: ", response.question)
#     speech = synthesiser(response.question, forward_params={"do_sample": True})

#     wav_bytes_io = io.BytesIO()
#     scipy.io.wavfile.write("bark_out.wav", rate=speech["sampling_rate"], data=speech["audio"])
#     wav_bytes = wav_bytes_io.getvalue()
#     print("Wav bytes: ", wav_bytes)
#     wav_bytes_io.close()
#     return wav_bytes
