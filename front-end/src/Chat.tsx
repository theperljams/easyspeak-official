import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Listen } from "./components/Listen.js";
import { ChatWindow } from "./components/ChatWindow.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./styles/Chat.module.css";


// functions for communicating with API
import { generateUserAudio, generateUserResponses, sendQuestionAnswerPair } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";

interface Props {
	messageHistory: Message[];
	setMessageHistory: (x: Message[]) => void;
}

export function Chat ({messageHistory, setMessageHistory} : Props) {
	const [initialLoad, setInitialLoad] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isListening, setIsListening] = useState(false);

	const [textInput, setTextInput] = useState('');
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [userGeneratedResponses, setUserGeneratedResponses] = useState(['', '', '']);
	
	// for use later: sending quesiton answer pairs to the database 
	const [question, setQuestion] = useState('');

	const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

	if (!browserSupportsSpeechRecognition) {
		return (<p>Browser does not support speech recognition...</p>);
	}

	const startListening = () => {
		setAudioURL(null);
		resetTranscript();
		SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
	};
	
	const generate = () => {
		setUserGeneratedResponses(['', '', '']);
		generateUserResponses(transcript, [...messages, { content: transcript, role: 'user' }])
			.then((r) => {
				setUserGeneratedResponses(r);
			})
			.catch((error) => {
				console.error('Error generating responses:', error);
			});
	}

	const stopListening = () => {
		SpeechRecognition.stopListening();

		if (transcript) {
			setMessages(prev => [...prev, { content: transcript, role: 'user' }]);
			setQuestion(transcript);
			generate();
		}
	};

	const handleUserInputSubmit = () => {
		console.log('handle User input submit');
		if (textInput !== '') {
			console.log('text input: ', textInput);
			setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
			sendQuestionAnswerPair(`Other: ${question} User: ${textInput}`, 'short');

			// Call generateUserAudio directly here
			generateUserAudio(textInput)
				.then((tempURL) => {
					console.log('audio URL:', tempURL);
					setAudioURL(tempURL);
					setTextInput('');
				})
				.catch((error) => {
					console.error('Error speaking:', error);
				});
		}
	};

	useEffect(() => {
		setMessageHistory(messages);
	}, [messages]);
	
	useEffect(() => {
		if (initialLoad) {
			if (isListening) {
				startListening();
			}
			else {
				stopListening();
			}
		}
		else {
			setInitialLoad(true);
		}
	}, [isListening]);
	
	useEffect(() => {
		if (messageHistory) {
			setMessages(messageHistory);
		}	
	}, []);

	return (
		<div className={styles.app}>
			<div className={styles.container}>
				<div className={styles.mainView}>
					<ChatWindow mode={'chat'} messages={messages} loading={isListening} transcript={transcript}/>
				</div>
				<RefreshButton handleRefresh={generate}/>
				{userGeneratedResponses && <div className={styles.responseView}>
					{<Responses responses={userGeneratedResponses} setInputText={setTextInput}/>}	
				</div>}
				<div className={styles.footer}>
					<Listen listen={isListening} toggleListen={() => {setIsListening((prev) => !prev);}}></Listen>
					<InputBar inputText={textInput} setInput={(s) => {setTextInput(s);}} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setButton={() => console.log('test')}/>
				</div>
			</div>
		</div>
	);
}
