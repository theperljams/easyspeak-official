
import { useState, useEffect, useRef, useCallback } from "react";

import { ChatWindow } from "./components/ChatWindow.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./styles/Training.module.css";

// functions for communicating with API
import {generateGPTQuestion, sendQuestionAnswerPairToShort } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import Header from "./components/Header.js";

const START_PROMPT = import.meta.env.VITE_START_PROMPT;

export function Training () {
	const [transcript, setTranscript] = useState('');
	const [textInput, setTextInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
    { // initial prompt
      role: 'system',
      content: `${START_PROMPT}`
    }
  ]);
	
	// for sending quesiton answer pairs to the database
	const [question, setQuestion] = useState('');

	const handleUserInputSubmit = () => {
    if (textInput != '') {
			setMessages(prev => [...prev, { role: 'user', content: textInput }]);
			getSystemReply();
			
			// TODO: change other to user name
			sendQuestionAnswerPairToShort(`Other: ${question} User: ${textInput}`);
    }
	}
	
	const getSystemReply = () => {
		setTranscript('...');
		setLoading(true)
		generateGPTQuestion(messages)
		.then((data) => {
			setLoading(false);
			setTranscript('');
			setQuestion(data);
			setMessages(prev => [...prev, { role: 'assistant', content: data }]);
		})
		.catch((error) => {
			console.log(error);
		})
	}
  
  useEffect(() => {
    getSystemReply();
  }, [])

	return (
		<div className={styles.app}>
			<div className={styles.container}>
				<div className={styles.mainView}>
					<ChatWindow messages={messages} loading={loading} transcript={transcript} title='Training Mode'/>
				</div>
				<div className={styles.footer}>
					<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={handleUserInputSubmit} audioURL={null} setButton={() => console.log('test')}/>
				</div>
			</div>
		</div>
	);
}