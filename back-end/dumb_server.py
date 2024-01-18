
import asyncio
import random
import wave
from fastapi import FastAPI, websockets
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import os

cool_app = FastAPI()

async def generate_random_words(websocket: WebSocket):
    while True:
        await asyncio.sleep(1)  # Wait for one second
        random_word = ''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(5))
        print("Random word: ", random_word)
        await websocket.send_text(random_word)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
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
    
    # Modify this part to return hardcoded text
    responses = ["This is a hardcoded response for the query endpoint." + question.question, "Another hardcoded response for the query endpoint." + question.question]
    return responses

@cool_app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):
    await websocket.accept()
    await generate_random_words(websocket)


@cool_app.websocket("/speak")  # Use @cool_app.websocket for WebSockets
async def handle_audio(websocket: WebSocket):  # Accept a WebSocket object
    await websocket.accept()  # Accept the WebSocket connection

    with wave.open("data/indigo.wav", "rb") as wav_file:  # Open the WAV file
        frames = wav_file.readframes(wav_file.getnframes())  # Read the audio frames
        await websocket.send_bytes(frames)  # Send the frames over the WebSocket


# ... (other existing routes)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(cool_app, host="0.0.0.0", port=8000)
