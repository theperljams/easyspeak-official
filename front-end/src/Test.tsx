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
	const [currentPage, setCurrentPage] = useState(0);
	const RESPONSES_PER_PAGE = 3;
	
	// for use later: sending quesiton answer pairs to the database 
	const [question, setQuestion] = useState('');

	const generate = () => {
		setUserGeneratedResponses(['', '', '']);
		setCurrentPage(0);
		setMessages(prev => [...prev, { content: textInput, role: 'user' }]);
		setQuestion(textInput);
		generateUserResponses(textInput, [...messages, { content: textInput, role: 'user' }])
			.then((r) => {
				setUserGeneratedResponses(r);
			})
			.catch((error) => {
				console.error('Error generating responses:', error);
			});
	};


	const handleUserInputSubmit = () => {
		console.log('handle User input submit');
		if (textInput !== '') {
			console.log('text input: ', textInput);
			sendQuestionAnswerPair(`Other: ${question} User: ${textInput}`, 'short');
			setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
			setCurrentPage(0);
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
				{<Responses 
					responses={userGeneratedResponses.slice(currentPage * RESPONSES_PER_PAGE, (currentPage + 1) * RESPONSES_PER_PAGE)} 
					setInputText={setTextInput} 
					isGenerating={false}
					currentPage={currentPage}
					totalPages={Math.ceil(userGeneratedResponses.length / RESPONSES_PER_PAGE)}
					onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(userGeneratedResponses.length / RESPONSES_PER_PAGE) - 1))}
					onPrevPage={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
				/>}
				</div>}
				<div className={styles.footer}>
					<TestInputBar inputText={textInput} setInput={(s) => {setTextInput(s);}} handleSubmitInput={handleUserInputSubmit} generate={generate}/>
				</div>
			</div>
		</div>
	);
}
