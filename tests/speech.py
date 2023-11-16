from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from transformers import AutoProcessor, BarkModel
import io
import scipy.io.wavfile
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

@app.post("/speak")
async def audio(response: Question):

    processor = AutoProcessor.from_pretrained("suno/bark")
    model = BarkModel.from_pretrained("suno/bark")

    voice_preset = "v2/en_speaker_6"

    inputs = processor(response.question, voice_preset=voice_preset)

    audio_array = model.generate(**inputs)
    audio_array = audio_array.cpu().numpy().squeeze()

    sample_rate = model.generation_config.sample_rate

    # Convert audio array to WAV file in memory
    wav_bytes_io = io.BytesIO()
    scipy.io.wavfile.write(wav_bytes_io, rate=sample_rate, data=audio_array)
    wav_bytes = wav_bytes_io.getvalue()
    wav_bytes_io.close()

    return wav_bytes

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)