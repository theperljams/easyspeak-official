from transformers import AutoProcessor, BarkModel
import torch
import sounddevice as sd
import numpy as np
import time
import os

#os.environ["SUNO_OFFLOAD_CPU"] = "True"
os.environ["SUNO_USE_SMALL_MODELS"] = "1"

device = "cuda" if torch.cuda.is_available() else "cpu"

modelname = "suno/bark-small"
#modelname = "suno/bark"
processor = AutoProcessor.from_pretrained(modelname)
#model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16)
model = BarkModel.from_pretrained(modelname, torch_dtype=torch.float16, use_flash_attention_2=True)
#model = BarkModel.from_pretrained(modelname)

model.to(device)

voice_preset = "v2/en_speaker_7"

# Measure the time to generate inputs
start_time_inputs = time.time()
inputs = processor("Hello.  I'd like to say, Jared is one groovy dude.", voice_preset=voice_preset)
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
