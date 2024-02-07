
import { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { Listen } from "./components/Listen.js";
import { ChatWindow } from "./components/ChatWindow.js";
import type { Message } from "./components/ChatWindow.js";
import type { GPTMessage } from "./components/Training.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

// functions for communicating with API
import {generateGPTQuestion, sendQuestionAnswerPairToShort } from "./Api.js";

const START_PROMPT = import.meta.env.VITE_START_PROMPT;

export function Training () {
	const [textInput, setTextInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
  
  // NOTES: 
  // two different sections of questions, let them talk about what they want to talk about.
  // prompts from config file

	const [gptMessages, setGptMessages] = useState<GPTMessage[]>([
    { // initial prompt
      role: 'system',
      content: `${START_PROMPT}`
    }
  ]);
	
	// for sending quesiton answer pairs to the database
	const [question, setQuestion] = useState('');

	const handleUserInputSubmit = () => {
    if (textInput != '') {
      setMessages(prev => [...prev, { message: textInput, side: 'right' }]);
        setGptMessages(prev => [...prev, { role: 'user', content: textInput }]);
        getSystemReply();
        
        // TODO: change other to user name
        sendQuestionAnswerPairToShort(`Other: ${question} User: ${textInput}`);
    }
	}
	
	const getSystemReply = () => {
		generateGPTQuestion(gptMessages)
		.then((data) => {
			setQuestion(data);
			setMessages(prev => [...prev, { message: data, side: 'left'}]);
			setGptMessages(prev => [...prev, { role: 'assistant', content: question }]);
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
			<div className={styles.mainView}>
				<ChatWindow messages={messages} loading={false} transcript={''} title='Training Mode'/>
				<Responses responses={[]} setInputText={setTextInput}/>
			</div>
			<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={handleUserInputSubmit} audioURL={null}/>
		</div>
	);
}