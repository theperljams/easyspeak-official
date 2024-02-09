# Use an official Python runtime as the base image
FROM python:3.10

# Install system-level dependencies for pyaudio
RUN apt-get update && apt-get install -y python3-pyaudio portaudio19-dev ffmpeg

# Set a working directory in the container
WORKDIR /app

# Copy your Python requirements file and install dependencies
COPY setup/requirements.txt .

# upgrade pip version
RUN pip install --upgrade pip

# Install required Python libraries
RUN pip install -r requirements.txt
RUN pip install pyaudio
RUN pip install -U langchain-community

# Copy data
COPY data /app/data

# Copy python files
COPY api.py dumb_server.py mp.py MyDataLoader.py Recorder.py Speecher.py Transcriber.py MyOpenai.py MySupa.py /app/

# Expose port 8000 for frontend use
EXPOSE 8080

# Env variable for openaikey
ENV OPENAI_API_KEY=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
ENV SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6d2xwZWt4bmdldmxlc3lrdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYyMTgyNDksImV4cCI6MjAyMTc5NDI0OX0.ypVAYmCz4NCthZyntGAPMN5W6zSJOtiJRx8O7XyCENU
ENV SUPABASE_URL=https://pzwlpekxngevlesykvfx.supabase.co

# Run your Python script when the container starts
CMD ["python","-u", "mp.py"]