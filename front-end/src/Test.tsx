import { useState, useEffect } from "react";
import { Responses } from "./components/Responses.js";
import { TestChat } from "./components/TestChat.js";
import { TestInputBar } from "./components/TestInputBar.js";

import styles from "./styles/Chat.module.css";


// functions for communicating with API
import { generateUserAudio, generateUserResponses, sendQuestionAnswerPair } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";
import { text } from "stream/consumers";

interface Props {
	messageHistory: Message[];
	setMessageHistory: (x: Message[]) => void;
}

export function Test ({messageHistory, setMessageHistory} : Props) {

	const [textInput, setTextInput] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [userGeneratedResponses, setUserGeneratedResponses] = useState(['', '', '']);
	
	// for use later: sending quesiton answer pairs to the database 
	const [question, setQuestion] = useState('');

	const generate = () => {
		setUserGeneratedResponses(['', '', '']);
		setMessages(prev => [...prev, { content: textInput, role: 'user' }]);
		setQuestion(textInput);
		generateUserResponses(textInput, [...messages, { content: textInput, role: 'user' }])
			.then((r) => {
				setUserGeneratedResponses(r);
			})
			.catch((error) => {
				console.error('Error generating responses:', error);
			});
	}


	const handleUserInputSubmit = () => {
		console.log('handle User input submit');
		if (textInput !== '') {
			console.log('text input: ', textInput);
			sendQuestionAnswerPair(`Other: ${question} User: ${textInput}`, 'short');
			setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
			
		}
	};

	useEffect(() => {
		setMessageHistory(messages);
	}, [messages]);
	
	
	useEffect(() => {
		if (messageHistory) {
			setMessages(messageHistory);
		}	
	}, []);

	return (
		<div className={styles.app}>
			<div className={styles.container}>
				<div className={styles.mainView}>
					<TestChat mode={'chat'} messages={messages}/>
				</div>
				{userGeneratedResponses && <div className={styles.responseView}>
					{<Responses responses={userGeneratedResponses} setInputText={setTextInput}/>}	
				</div>}
				<div className={styles.footer}>
					<TestInputBar inputText={textInput} setInput={(s) => {setTextInput(s);}} handleSubmitInput={handleUserInputSubmit} generate={generate}/>
				</div>
			</div>
		</div>
	);
}
