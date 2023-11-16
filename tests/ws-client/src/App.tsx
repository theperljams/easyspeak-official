// MinimalClient.tsx
import React, { useState } from 'react';
import './App.css';

const WEBSOCKET_URL = 'ws://0.0.0.0:8000/transcribe';

const MinimalClient: React.FC = () => {
  const [listenBtn, setListenBtn] = useState('Start Listening');
  const [isListening, setIsListening] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  const doListen = () => {
    if (isListening) {
      // If already listening, stop listening
      webSocket?.close();
      setListenBtn('Start Listening');
    } else {
      // If not listening, start listening
      const socket = new WebSocket(WEBSOCKET_URL);

      socket.onopen = () => {
        console.log('WebSocket connection opened');
      };

      setListenBtn('Stop Listening');

      socket.onmessage = (event) => {
        // Handle incoming transcription results
        const transcriptionResult = event.data;
        console.log('Transcription Result:', transcriptionResult);
        setTranscription((prevTranscription) => prevTranscription + ' ' + transcriptionResult);
        socket.send('ACK'); // Send acknowledgement back to server
      };

      socket.onclose = (event) => {
        if (event.wasClean) {
          console.log('WebSocket closed cleanly:', event);
        } else {
          console.log('WebSocket connection closed unexpectedly:', event);
        }
      };

      setWebSocket(socket);
    }
    setIsListening((prevIsListening) => !prevIsListening); // Toggle listening state
  };

  return (
    <div>
      <h1>Minimal Voice Input Client</h1>
      <button onClick={doListen}>{listenBtn}</button>
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default MinimalClient;
