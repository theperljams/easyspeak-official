import React, { useState, useEffect } from 'react';
import './App.css';

const WEBSOCKET_URL = 'ws://localhost:8000/transcribe';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const doListen = async () => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = (event) => {
      console.log('WebSocket connection opened:', event);
    };



    socket.onmessage = (event) => {
      // Handle incoming transcription results
      const transcriptionResult = event.data;
      console.log('Transcription Result:', transcriptionResult);
      setText(transcriptionResult);
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log('WebSocket closed cleanly:', event);
      } else {
        console.log('WebSocket connection closed unexpectedly:', event);
      }
    };

    setSocket(socket);
}

  return (
    <div className='page-container'>
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={doListen}>Get Response</button>
      </div>
    </div>
  );
};

export default App;
