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
			// Advance to next page if there are more responses
			const maxPages = Math.ceil(userGeneratedResponses.length / RESPONSES_PER_PAGE);
			if (currentPage < maxPages - 1) {
				setCurrentPage(prev => prev + 1);
			}
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

	const totalPages = Math.ceil(userGeneratedResponses.length / RESPONSES_PER_PAGE);
	const displayedResponses = userGeneratedResponses.slice(currentPage * RESPONSES_PER_PAGE, (currentPage + 1) * RESPONSES_PER_PAGE);

	return (
		<div className={styles.app}>
			<div className={styles.container}>
				<div className={styles.mainView}>
					<TestChat mode={'chat'} messages={messages}/>
				</div>
				{userGeneratedResponses && (
					<div 
						className={styles.responseView}
						style={{ 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center', 
							gap: '10px',
							width: '100%' 
						}}
					>
						{totalPages > 1 && (
							<button 
								onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} 
								disabled={currentPage === 0}
								style={{
									background: currentPage === 0 ? '#cccccc' : '#007AF0',
									border: '2px solid #0056b3',
									borderRadius: '50%',
									width: '80px',
									height: '80px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
									color: '#FFFFFF',
									boxShadow: currentPage === 0 ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2)',
									flexShrink: 0,
									fontSize: '24px',
									fontWeight: 'bold'
								}}
							>
								‹
							</button>
						)}

						<Responses 
							responses={displayedResponses} 
							setInputText={setTextInput} 
							isGenerating={false}
						/>

						{totalPages > 1 && (
							<button 
								onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))} 
								disabled={currentPage >= totalPages - 1}
								style={{
									background: currentPage >= totalPages - 1 ? '#cccccc' : '#007AF0',
									border: '2px solid #0056b3',
									borderRadius: '50%',
									width: '80px',
									height: '80px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
									color: '#FFFFFF',
									boxShadow: currentPage >= totalPages - 1 ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2)',
									flexShrink: 0,
									fontSize: '24px',
									fontWeight: 'bold'
								}}
							>
								›
							</button>
						)}
					</div>
				)}
				<div className={styles.footer}>
					<TestInputBar inputText={textInput} setInput={(s) => {setTextInput(s);}} handleSubmitInput={handleUserInputSubmit} generate={generate}/>
				</div>
			</div>
		</div>
	);
}
