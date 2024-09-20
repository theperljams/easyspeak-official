// AudioTranscriber.tsx

import { useEffect } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

interface AudioTranscriberProps {
  onTranscript: (transcript: string) => void;
  setIsListening: (listening: boolean) => void;
}

export function AudioTranscriber({ onTranscript, setIsListening }: AudioTranscriberProps) {
  useEffect(() => {
    let dgConnection: any = null;
    let recorder: MediaRecorder | null = null;

    const setup = async () => {
      try {
        const key = import.meta.env.VITE_DEEPGRAM_API_KEY;
        if (!key) {
          console.error(
            'No Deepgram API key available. Please set VITE_DEEPGRAM_API_KEY in your .env file.'
          );
          return;
        }

        // Initialize Deepgram SDK
        const deepgram = createClient(key);

        // Request access to the user's microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create a Deepgram live transcription connection
        dgConnection = deepgram.listen.live({
          model: 'nova'
        });

        dgConnection.on(LiveTranscriptionEvents.Open, () => {
          console.log('Deepgram connection opened.');
          setIsListening(true);

          // Create a MediaRecorder instance
          recorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

          // Start recording
          recorder.start(250); // Capture in 250ms chunks

          // Event listener for when audio data is available
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0 && dgConnection.getReadyState() === 1) {
              // Send the recorded audio data directly to Deepgram
              dgConnection.send(event.data);
            }
          };

          recorder.onstop = () => {
            console.log('Recorder stopped.');
          };
        });

        dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
          if (data.channel.alternatives[0]) {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript && data.isFinal) {
              console.log('Transcription:', transcript);
              onTranscript(transcript);
            }
          }
        });

        dgConnection.on(LiveTranscriptionEvents.Close, () => {
          console.log('Deepgram connection closed.');
          setIsListening(false);
        });

        dgConnection.on(LiveTranscriptionEvents.Error, (error) => {
            console.error('Deepgram error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setIsListening(false);
          });
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while accessing the microphone or connecting to Deepgram.');
      }
    };

    setup();

    // Cleanup function
    return () => {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (dgConnection) {
        dgConnection.finish();
      }
    };
  }, [onTranscript, setIsListening]);

  return null; // This component doesn't render any visible UI
}
