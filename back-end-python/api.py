from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import dotenv
import asyncio

from MyOpenai import get_embedding, generate_responses
from MySupa import get_context_short, get_context_long

dotenv.load_dotenv()

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
    content: str
    messages: list = []
    

@cool_app.post("/generate")
async def query_chain(question: Question):
    # 1. generate embedding based on the question given
    embedding = await get_embedding(question.content) 

    # 2. fetch relevant information from supabase
    context_short = await get_context_short(embedding)
    context_long = await get_context_long(embedding)
    
    # 3. use information in prompt with chatGpt to generate responses
    result = await generate_responses(question, context_short, context_long)
    
    # 4. parse responses
    result_list = parse_numbered_list(result)
    print(result_list)
    
    # 5. return resulting list
    return result_list

@cool_app.post("/speak")
async def handle_audio(request: Question):
    try:
        # Put the question text in the queue
        cool_app.generated_queue.put(request.content)

        # Continuously check for and send available audio data
        while True:
            audio_data = b""

            while not cool_app.speech_queue.empty():
                audio_part = cool_app.speech_queue.get()
                audio_data += audio_part
                print("[WEB]:\t Got audio")

            if audio_data:
                print("[WEB]:\t Sending audio")
                return Response(audio_data, media_type="audio/wav")  # Assuming WAV audio

            await asyncio.sleep(0.1)  # Adjust sleep time as needed

    except Exception as e:
        print(f"[WEB]:\t Error handling request: {e}")
        return Response(status_code=500, content="Internal server error")
    
def has_numerical_character(text):
    return any(char.isdigit() for char in text)

def parse_numbered_list(input_string):
    if not has_numerical_character(input_string):
        return [input_string]

    lines = input_string.strip().split('\n')
    items = []

    for line in lines:
        parts = line.split('. ', 1)
        if len(parts) == 2 and parts[0].isdigit():
            item_content = parts[1].strip()
            items.append(item_content)

    return items
       