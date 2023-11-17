from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from transformers import AutoProcessor, BarkModel
import io
import torch
import numpy as np
import os
import base64
import scipy.io.wavfile
from fastapi.middleware.cors import CORSMiddleware
import sounddevice as sd

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

    os.environ["SUNO_OFFLOAD_CPU"] = "False"
    os.environ["SUNO_USE_SMALL_MODELS"] = "1"

    device = "cuda" if torch.cuda.is_available() else "cpu"

    modelname = "suno/bark-small"
    #modelname = "suno/bark"
    processor = AutoProcessor.from_pretrained(modelname)
    print("set processor")
    model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16)
    print("set model")
    # model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16, use_flash_attention_2=True)
    #model = BarkModel.from_pretrained(modelname)

    model.to(device)
    print("model to device")

    voice_preset = "v2/en_speaker_7"

    inputs = processor(response.question, voice_preset=voice_preset)
    print("set inputs")

    inputs = {key: value.to(device) for key, value in inputs.items()}
    print("set inputs to device")

    audio_array = model.generate(**inputs)
    print("generated audio array")

    audio_array = audio_array.cpu().numpy().squeeze()
    audio_array = audio_array.astype(np.float64)
    print("converted audio array")

    sample_rate = model.generation_config.sample_rate

    with io.BytesIO() as wav_file:
        scipy.io.wavfile.write(wav_file, sample_rate, audio_array)
        wav_file.seek(0)
        wav_data = wav_file.read()

    # Encode WAV byte string to base64 for transfer
    b64_encoded_audio = base64.b64encode(wav_data).decode('utf-8')

    # # Convert audio array to WAV file in memory
    # wav_file = scipy.io.wavfile.write("out.wav", rate=sample_rate, data=audio_array)
   
    return b64_encoded_audio

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)