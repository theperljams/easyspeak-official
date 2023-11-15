from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
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
    synthesiser = pipeline("text-to-speech", "suno/bark-small")
    print("Response: ", response.question)
    speech = synthesiser(response.question, forward_params={"do_sample": True})

    wav_bytes_io = io.BytesIO()
    scipy.io.wavfile.write(wav_bytes_io, rate=speech["sampling_rate"], data=speech["audio"])
    wav_bytes = wav_bytes_io.getvalue()
    wav_bytes_io.close()
    return wav_bytes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)