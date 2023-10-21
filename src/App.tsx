
import React, { useState, useEffect } from 'react';
import './App.css';
import MicInput from './MicInput';
import dospeak from './speak';

const SERVER_URL = `http://0.0.0.0:8000/query`;

const App: React.FC = () => {
    const [voiceInput, setVoiceInput] = useState('');
    const [responseValue, setResponseValue] = useState('');
    const [listenBtn, setListenBtn] = useState('Listen');
    const [isListening, setIsListening] = useState(false);
    var input = MicInput();
    // var messageHistory: Array<string> = people['history'];
    var blob: Blob;

    const [audioURL, setAudioURL] = useState<string | null>(null); // Initialize the state with a null value

    useEffect(() => {
        if (input.transcript && input.transcript.text) {
            setVoiceInput(input.transcript.text);
        };

    }, [input.transcript]);

    useEffect(() => {
       setResponseValue("");
      }, []);
    
    useEffect(() => {
        if(isListening) {
            setListenBtn('Stop Recording');
            transcribe(isListening);
        }
        else {
            setListenBtn('Listen');
            console.log('done listening')
        }
    }, [isListening]);

    const clear = () => {
        setVoiceInput('');
    };


    function doListen() {
        if (!isListening) { 
            input.startRecording();

            setIsListening(true);
        }
        else {
            input.stopRecording();
            setIsListening(false);
            setListenBtn('Listen');
        }
    }

    /*function transcribePromise(){
        return new Promise((resolve, reject) => {
            console.log('promise: ' + isListening);
            if(isListening) {
                setTimeout(() => {console.log("timeout")}, 2000);
                resolve(isListening);
            }
            else {
                resolve(isListening);
            }
        }).then(
            (value) => {
                if(value) {
                    console.log('resolve:' + value);
                transcribePromise();
                }
                else {
                    console.log('donzo');
                }
                
            },
            () => {
                console.log('reject');
            }
        )
    } */


    function transcribe(isListening: string | boolean) {
        console.log('isListening:' + isListening);
        if(isListening) {
            console.log('listening');
            //transcribePromise(); 
            //setVoiceInput();
            //setTimeout(transcribe, 100, isListening)
        }
        else {
            console.log("done");
        }
    }

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

//     function generate() {
//         console.log(inputValue);
//         axios.post('http://0.0.0.0:3001/query', inputValue, {
//   headers: {
//     'Content-Type': 'application/json',
//   },
// }).then(res => {
//         if (res != null) {
//             setResVal1(res.data);
//         }
//         else {
//             setResponseValue(people['default response']);
//         }
//         });
        
//     }

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

