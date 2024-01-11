
import React, { useState, useEffect } from 'react';
import './App.css';

const SERVER_URL = `http://0.0.0.0:8000`;

const WEBSOCKET_URL = 'ws://0.0.0.0:8000';

const App: React.FC = () => {
    const [voiceInput, setVoiceInput] = useState('');
    const [responseValue, setResponseValue] = useState('');
    const [listenBtn, setListenBtn] = useState('Listen');
    const [isListening, setIsListening] = useState(false);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

    const [audioURL, setAudioURL] = useState<string | null>(null); // Initialize the state with a null value

    const doListen = async () => {
      if (isListening) {
        // If already listening, stop listening
        webSocket?.close();
        setListenBtn('Listen');
      } else {
        // If not listening, start listening
        const socket = new WebSocket(WEBSOCKET_URL + '/transcribe');
  
        socket.onopen = (event) => {
          console.log('WebSocket connection opened:', event);
        };
  
        setListenBtn('Stop Recording');
  
        socket.onmessage = (event) => {
          // Handle incoming transcription results
          const transcriptionResult = event.data;
          console.log('Transcription Result:', transcriptionResult);
          setVoiceInput((prevInput) => prevInput + ' ' + transcriptionResult);
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
    
    
    useEffect(() => {
       setResponseValue("");
      }, []);
    

    const clear = () => {
        setVoiceInput('');
    };

    const handleSpeak = async () => {
      try {
        // Initialize a WebSocket connection
        const socket = new WebSocket(WEBSOCKET_URL + '/speak');
    
        // Event handler for when the WebSocket connection is opened
        socket.onopen = (event) => {
          console.log('WebSocket connection opened:', event);
    
          // Send the question to the server
          const message = { question: responseValue };
          socket.send(JSON.stringify(message));
        };
    
        // Event handler for when the WebSocket receives a message
        socket.onmessage = async (event) => {
          // Handle incoming audio data
          const audioData = await event.data.arrayBuffer();
          const audioBlob = new Blob([audioData], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
    
          setAudioURL(audioUrl);
          console.log('Audio URL:', audioUrl);
    
          // Close the WebSocket connection after receiving the audio
          socket.close();
          console.log('WebSocket connection closed');
        };
    
        // Event handler for when the WebSocket connection is closed
        socket.onclose = (event) => {
          if (event.wasClean) {
            console.log('WebSocket closed cleanly:', event);
          } else {
            console.log('WebSocket connection closed unexpectedly:', event);
          }
        };
      } catch (error) {
        console.error('Error:', error);
      }
    };
    



async function generate(): Promise<void> {
    const res = await fetch(SERVER_URL + "/query", {
      method: 'POST',
      body: "{\"question\": \"" + voiceInput + "\"}",
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    });
    const data = await res.text();
    console.log(res);
    if (res.status === 200) {
      setResponseValue(data);
    } else {
      setResponseValue('I don\'t know');
    }
  }
  

    function chooseResponse(val: string) {
       setVoiceInput(val);
    }


    return (
        <div className='page-container'>

        <div>
            
            <div className='text-area'>
                <textarea className='text-box' id="text-input"   value={voiceInput}    onChange={(e) => setVoiceInput(e.target.value)} />
                <textarea className='text-box' id="response-box" value={responseValue} onClick={()   => chooseResponse(responseValue)} />
                <div>
                    {audioURL && (
                        <audio autoPlay key={audioURL}>
                            <source src={audioURL} type="audio/mpeg" />
                        </audio>
                    )}
                </div>
            </div>
            <div className='btn-container'>
                <button className="listen-btn large-btn"   onClick={doListen} >{listenBtn}</button>
                <button className='generate-btn large-btn' onClick={generate} >Generate</button>
                <button className='play-btn large-btn'     onClick={handleSpeak}    >Speak</button>
                <button className='clear-btn large-btn'    onClick={clear}    >Clear</button>

            </div>
        </div>
        </div>

    );



};

export default App;