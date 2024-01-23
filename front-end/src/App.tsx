
import { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import type { Message } from "./components/Chat.jsx";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

const SERVER_URL = "http://0.0.0.0:8080";

export function App () {
	const [isListening, setIsListening] = useState(false);
	const [initialLoad, setInitialLoad] = useState(false);
	const [inputText, setInputText] = useState("");
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [responses, setResponses] = useState(["", "", "", ""]);
	const [speaking, setSpeaking] = useState(false);
	const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();
	
	if (!browserSupportsSpeechRecognition) {
		return (<p>Browser does not support speech recognition...</p>)
	}
	
	const startListening = () => {
		console.log("starting listening");
		resetTranscript();
		SpeechRecognition.startListening({continuous:true, language:"en-IN"});
	}
	
	const stopListening = () => {
		console.log("stopping listen");
		SpeechRecognition.stopListening();
		
		if (transcript) {
			setMessages((prev) => [...prev, { message: transcript, side: 'left'}]);
			setResponses(['', '', '', '']);
			generate(transcript)
				.then((r) => {
					console.log(r);
					setResponses(r);
				})
				.catch((error) => {
					console.error('Error generating responses:', error);
				});
		}
	}
	
	useEffect(() => {
		if (initialLoad) {
			if (isListening) {
				startListening();
			} else {
				stopListening();
			}
		} else {
			setInitialLoad(true);
		}
	}, [isListening])

  async function generate(voiceInput: string): Promise<string[]> {
		const res = await fetch(`${SERVER_URL}/query`, {
			method: 'POST',
			// Assuming the server expects an array of questions
			body: JSON.stringify({ question: voiceInput }),
			headers: {
				'Content-Type': 'application/json',
				'accept': 'application/json',
			},
		});

		const data = await res.json() as string[];
		console.log('response: ', data);
		return data;
	}
	
	function chooseResponse() {
		console.log("we be speaking");
		setMessages(prevMessages => [...prevMessages, { message: inputText, side: 'right' }]);
		setSpeaking(true);
	}

  async function speak(voiceInput: string): Promise<string | Blob> {
    try {
      const res = await fetch(`${SERVER_URL}/speak`, {
        method: 'POST',
        body: JSON.stringify({ question: voiceInput }),
        headers: {
          'Content-Type': 'application/json',
          'accept': 'audio/wav', // Indicate expecting audio data
        },
      });
  
      if (res.ok) {
        const audioData = await res.blob(); // Get audio bytes as a Blob
        console.log('audio data:', audioData);
        return audioData; // Return the audio data directly
      } else {
        console.error('Error fetching audio:', res.statusText);
        return "No audio available";
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      return "No audio available";
    }
  }

	useEffect(() => {
    if (speaking) {
		console.log('speaking');
      speak(inputText).then((audioData) => {
        if (audioData instanceof Blob) {
          const audioURL = URL.createObjectURL(audioData);
          console.log('audio URL:', audioURL);
          setAudioURL(audioURL);
		  setSpeaking(false);
		  setInputText("");
        } else {
          console.error('Error generating audio:', audioData);
        }
      });
    }
		
	}, [speaking]);

	return (
		<div className={styles.app}>
			<Listen listen={isListening} toggleListen={() => {setIsListening((prev) => !prev)}} />
			<div className={styles.mainView}>
				<Chat messages={messages} loading={isListening} transcript={transcript}/>
				<Responses responses={responses} setInputText={setInputText}/>
			</div>
			<InputBar inputText={inputText} onInputChange={(s) => {setInputText(s)}} speak={chooseResponse} audioURL={audioURL}/>
		</div>
	);
}