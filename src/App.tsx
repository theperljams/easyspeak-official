
import React, { useState, useEffect } from 'react';
import './App.css';
import MicInput from './MicInput';
import dospeak from './speak';

const SERVER_URL = `http://0.0.0.0:8000/query`;

const WEBSOCKET_URL = 'ws://0.0.0.0:8000/transcribe';

const App: React.FC = () => {
    const [voiceInput, setVoiceInput] = useState('');
    const [responseValue, setResponseValue] = useState('');
    const [listenBtn, setListenBtn] = useState('Listen');
    const [isListening, setIsListening] = useState(false);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    var input = MicInput();
    var blob: Blob;

    const [audioURL, setAudioURL] = useState<string | null>(null); // Initialize the state with a null value

    const doListen = async () => {
        const socket = new WebSocket(WEBSOCKET_URL);
    
        socket.onopen = (event) => {
          console.log('WebSocket connection opened:', event);
        };

        setListenBtn('Stop Recording');
    
        socket.onmessage = (event) => {
          // Handle incoming transcription results
          const transcriptionResult = event.data;
          console.log('Transcription Result:', transcriptionResult);
          setVoiceInput(transcriptionResult);
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
    
    
    useEffect(() => {
       setResponseValue("");
      }, []);
    

    const clear = () => {
        setVoiceInput('');
    };


    const handleSpeak = async (inputstr: string) => {
        try {
            blob = await dospeak(inputstr);
            //console.log(data);
            console.log("done speak");
            //const blob = binarytoBlob(data);
            console.log(blob);
            const url = URL.createObjectURL(blob);
            console.log(url);
            setAudioURL(url); // Update the audioURL state with the returned URL
        } catch (error) {
            // Handle any errors that occurred during the dospeak function call
            console.error('Error occurred while speaking:', error);
        }
    }

    function speak() {
        handleSpeak(voiceInput);
    }


async function generate(): Promise<void> {
    console.log(voiceInput);
    // input.stopRecording();
    // setIsListening(false);
    console.log(SERVER_URL);

    const res = await fetch(SERVER_URL, {
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
                <button className='play-btn large-btn'     onClick={speak}    >Speak</button>
                <button className='clear-btn large-btn'    onClick={clear}    >Clear</button>

            </div>
        </div>
        </div>

    );



};

export default App;

