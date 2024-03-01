
import {useEffect, useState} from 'react';

import {ChatWindow} from './components/ChatWindow.js';
import {InputBar} from './components/InputBar.js';


import styles from "./styles/Training.module.css";

// functions for communicating with API
import {generateGPTQuestion, sendQuestionAnswerPair } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { Responses } from "./components/Responses.js";

const START_PROMPT_SHORT = import.meta.env.VITE_START_SHORT;
const START_PROMPT_LONG = import.meta.env.VITE_START_LONG;

const SHORT = 'short';
const LONG = 'long';

export function Training() {
	const [transcript, setTranscript] = useState('');
	const [textInput, setTextInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [chatMode, setChatMode] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	
	const [introMessages, setIntroMessages] = useState<Message[]>([
		{
			role: 'assistant',
			content: 'Welcome to training mode!'
		},
		{
			role: 'assistant',
			content: 'please make a selection to begin training'
		}
	]);

	// for sending quesiton answer pairs to the database
	const [question, setQuestion] = useState('');

	const handleUserInputSubmit = () => {
		if (textInput != '') {
			setMessages(prev => [...prev, { role: 'user', content: textInput }]);
			getSystemReply();

			// TODO: change other to user name
			sendQuestionAnswerPair(`Other: ${question} User: ${textInput}`, chatMode);
		}
	};
  
	const getSystemReply = () => {
		console.log('yes');
		setTranscript('...');
		setLoading(true);
		generateGPTQuestion(messages, chatMode == SHORT ? 'short' : 'long')

			.then((data) => {
				setLoading(false);
				setTranscript('');
				setQuestion(data);
				setMessages(prev => [...prev, { role: 'assistant', content: data }]);
			})
			.catch((error) => {
				console.log(error);
			});
	};
	const goBack = () => {
		setChatMode('');
		window.location.reload();
	}
	
	useEffect(() => {
		if (chatMode != '') {
			if (chatMode == SHORT) {
				setIntroMessages(prev => [...prev, { role: 'assistant', content: `You selected: ${chatMode} mode. The following questions will allow EasySpeak to get to know some basic information about you. 
				Treat this like having causal small talk with a friend. Be as authentic as possible.`}]);
			}
			else {
				setIntroMessages(prev => [...prev, { role: 'assistant', content: `You selected: ${chatMode} mode. The following questions will allow EasySpeak to get to know you on a deeper level, as well as your writing style. 
				Treat this like something between writing a blog post or a journal entry (because blog posts are public, but journal entries are deep). These questions are meant to prompt ~200 word answers. Really go deep.` }]);
			}
			if (chatMode == LONG) {
				setMessages([{role: 'system', content: START_PROMPT_LONG}]);
			} else {
				setMessages([{role: 'system', content: START_PROMPT_SHORT}]);
			}
			getSystemReply();
		}
	}, [chatMode]);
  
	useEffect(() => {
		if (chatMode != '') {
			getSystemReply();
		}
	}, []);

	return (
		<div className={styles.app}>
			<div className={styles.container}>
				<div className={styles.mainView}>
					<ChatWindow mode={'training'} messages={messages} loading={loading} transcript={transcript} introMessages={introMessages}/>
				</div>
				{chatMode == '' && <div className={styles.responseView}>
					{<Responses responses={[SHORT, LONG]} setInputText={setChatMode}/>}	
				</div>}
				{chatMode != '' && <div className={styles.responseView}>
					{<Responses responses={[' ', 'Select mode', ' ']} setInputText={goBack}/>}
				</div>}

				<div className={styles.footer}>
					<InputBar loading={loading} inputText={textInput} setInput={(s) => {setTextInput(s);}} handleSubmitInput={handleUserInputSubmit} audioURL={null} setButton={() => console.log('test')}/>
				</div>
			</div>
		</div>
	);
}
