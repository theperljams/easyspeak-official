
import { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import type { Message } from "./components/Chat.jsx";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";
import { Training } from "./components/Training.js";

import styles from "./App.module.css";

const SERVER_URL = "http://0.0.0.0:8080";

export function App () {
	const [initialLoad, setInitialLoad] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isListening, setIsListening] = useState(false);
	
	const [textInput, setTextInput] = useState("");
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [userGeneratedResponses, setUserGeneratedResponses] = useState(["", "", "", ""]);
	
	// TRAINING MODE
	const [isTraining, setIsTraining] = useState(false);
	const [initialQuestion, setInitialQuestion] = useState(false);
	const [trainingPrompt, setTrainingPrompt] = useState("");
	const [trainingMessages, setTrainingMessages] = useState<Message[]>([]);
	
	const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();
	
	if (!browserSupportsSpeechRecognition) {
		return (<p>Browser does not support speech recognition...</p>)
	}
	
	const startListening = () => {
		resetTranscript();
		SpeechRecognition.startListening({continuous:true, language:"en-IN"});
	}
	
	const stopListening = () => {
		SpeechRecognition.stopListening();
		
		if (transcript) {
			setMessages((prev) => [...prev, { message: transcript, side: 'left'}]);
			setUserGeneratedResponses(['', '', '', '']);
			generateUserResponses(transcript)
				.then((r) => {
					setUserGeneratedResponses(r);
				})
				.catch((error) => {
					console.error('Error generating responses:', error);
				});
		}
	}

  const generateUserResponses = async (input: string) => {
		const res = await fetch(`${SERVER_URL}/query`, {
			method: 'POST',
			body: JSON.stringify({ question: input }),
			headers: {
				'Content-Type': 'application/json',
				'accept': 'application/json',
			},
		});

		const data = await res.json() as string[];
		console.log('response: ', data);
		return data;
	}
	
	const handleSubmitInput = () => {
		if (isTraining) {
			console.log('do not say a word');
		} else {
			setMessages(prevMessages => [...prevMessages, { message: textInput, side: 'right' }]);
			setIsSpeaking(true);
		}
	}

  const speak = async (input: string) => {
		if (!isTraining) {
			try {
				const res = await fetch(`${SERVER_URL}/speak`, {
					method: 'POST',
					body: JSON.stringify({ question: input }),
					headers: {
						'Content-Type': 'application/json',
						'accept': 'audio/wav',
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
  }

	useEffect(() => {
    if (isSpeaking) {
      speak(textInput)
				.then((audioData) => {
					if (audioData instanceof Blob) {
						const audioURL = URL.createObjectURL(audioData);
						console.log('audio URL:', audioURL);
						setAudioURL(audioURL);
						setIsSpeaking(false);
						setTextInput("");
					}
				})
				.catch((error) => {
					console.error('Error speaking:', error);
				});
    }
	}, [isSpeaking]);
	
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
	}, [isListening]);
	
	useEffect(() => {
		if (isTraining) {
			console.log('should be training now');
		}
	}, [isTraining]);

	return (
		<div className={styles.app}>
			<Listen listen={isListening} toggleListen={() => {setIsListening((prev) => !prev)}} />
			<div className={styles.mainView}>
				{!isTraining && <Chat messages={messages} loading={isListening} transcript={transcript}/>}
				{isTraining && <Training messages={trainingMessages} transcript={trainingPrompt}/>}
				<Responses responses={userGeneratedResponses} setInputText={setTextInput} isTraining={isTraining}/>
			</div>
			<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={handleSubmitInput} audioURL={audioURL} setIsTraining={() => {setIsTraining((prev) => !prev)}}/>
		</div>
	);
}