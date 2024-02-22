
import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { Listen } from "./components/Listen.js";
import { ChatWindow } from "./components/ChatWindow.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import Draggable from "react-draggable";

import styles from "./Chat.module.css";

// functions for communicating with API
import { generateUserAudio, generateUserResponses } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { Header } from "./components/Header.js";

export function Chat () {
	const [initialLoad, setInitialLoad] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isListening, setIsListening] = useState(false);
	
	const [textInput, setTextInput] = useState("");
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [userGeneratedResponses, setUserGeneratedResponses] = useState(["", "", "", ""]);
	
	// for use later: sending quesiton answer pairs to the database 
	const [question, setQuestion] = useState('');




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
			setMessages((prev) => [...prev, { content: transcript, role: 'user'}]);
			setUserGeneratedResponses(['', '', '', '']);
			generateUserResponses(transcript, [...messages, {content: transcript, role: 'user'}])
				.then((r) => {
					setUserGeneratedResponses(r);
				})
				.catch((error) => {
					console.error('Error generating responses:', error);
				});
		}
	}

	const handleUserInputSubmit = () => {
    if (textInput != '') {
      setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
			setIsSpeaking(true);
    }
	}

	useEffect(() => {
    if (isSpeaking) {
      generateUserAudio(textInput)
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

	return (
		<div className={styles.app}>
			<Header title={'Chat'}/>
			<div className={styles.mainView}>
				<ChatWindow messages={messages} loading={isListening} transcript={transcript} title='Chat'/>
				<Responses responses={userGeneratedResponses} setInputText={setTextInput}/>
			</div>
			<Draggable
				defaultPosition={{x: 30, y: -30}}>
				<div className={styles.dragView}>
					BLOCK
				<Listen listen={isListening} toggleListen={() => {setIsListening((prev) => !prev)}}></Listen>
				</div>
			</Draggable>
			<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setButton={() => console.log('test')}/>
		</div>
	);
}