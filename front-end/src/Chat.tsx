
import { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { Listen } from "./components/Listen.js";
import { ChatWindow } from "./components/ChatWindow.js";
import type { Message } from "./components/ChatWindow.js";
import type { GPTMessage } from "./components/Training.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";
import { Training } from "./components/Training.js";

import styles from "./App.module.css";

// functions for communicating with API
import {generateGPTQuestion, generateUserAudio, generateUserResponses, sendQuestionAnswerPair, signOut } from "./Api.js";

const START_PROMPT = import.meta.env.VITE_START_PROMPT;

export function Chat () {
	const [initialLoad, setInitialLoad] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isListening, setIsListening] = useState(false);
	
	const [textInput, setTextInput] = useState("");
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [userGeneratedResponses, setUserGeneratedResponses] = useState(["", "", "", ""]);
  
  // NOTES: 
  // two different sections of questions, let them talk about what they want to talk about.
  // prompts from config file
	
	// TRAINING MODE
	const [hasOpenTraining, setHasOpenTraining] = useState(false);
	const [isTrainingMode, setIsTrainingMode] = useState(false);
	const [trainingPrompt, setTrainingPrompt] = useState(""); // TBD for slow display of message
	const [trainingMessages, setTrainingMessages] = useState<Message[]>([]);
	const [gptMessages, setGptMessages] = useState<GPTMessage[]>([
    { // initial prompt
      role: 'system',
      content: `${START_PROMPT}`
    }
  ]);
	
	// for sending quesiton answer pairs to the database
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

	const handleUserInputSubmit = () => {
    if (textInput != '') {
      if (isTrainingMode) {
        setTrainingMessages(prev => [...prev, { message: textInput, side: 'right' }]);
        setGptMessages(prev => [...prev, { role: 'user', content: textInput }]);
        getSystemReply();
        
        // put Q&A pair into the db TODO: change name
        sendQuestionAnswerPair(`Other: ${question} User: ${textInput}`);
      } else {
        setMessages(prev => [...prev, { message: textInput, side: 'right' }]);
        setIsSpeaking(true);
      }
    }
	}
	
	const getSystemReply = () => {
		generateGPTQuestion(gptMessages)
		.then((data) => {
			setQuestion(data);
			setTrainingMessages(prev => [...prev, { message: data, side: 'left'}]);
			setGptMessages(prev => [...prev, { role: 'assistant', content: question }]);
		})
		.catch((error) => {
			console.log(error);
		})
	}
	
	// will eventually be swapped back to be to edit mode
	const onTrainingClicked = () => {
		setIsTrainingMode(prev => !prev);
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
	
	useEffect(() => {
		if (hasOpenTraining) {
			getSystemReply();
		}
	}, [hasOpenTraining]);

	return (
		<div className={styles.app}>
			<Listen listen={isListening} toggleListen={() => {setIsListening((prev) => !prev)}} />
			<div className={styles.mainView}>
				{!isTrainingMode && <ChatWindow messages={messages} loading={isListening} transcript={transcript}/>}
				{isTrainingMode && <Training messages={trainingMessages} transcript={trainingPrompt} session={hasOpenTraining} setSessionStarted={() => setHasOpenTraining(true)}/>}
				<Responses responses={userGeneratedResponses} setInputText={setTextInput} isTraining={isTrainingMode}/>
			</div>
			<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setIsTraining={onTrainingClicked}/>
			<InputBar inputText={textInput} setInput={(s) => {setTextInput(s)}} handleSubmitInput={signOut} audioURL={audioURL} setIsTraining={onTrainingClicked}/> 
		</div>
	);
}