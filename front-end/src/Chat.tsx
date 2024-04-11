import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Listen } from "./components/Listen.js";
import { ChatWindow } from "./components/ChatWindow.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./styles/Chat.module.css";
import { generateUserAudio, generateUserResponses, sendQuestionAnswerPair } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";

interface Props {
    messageHistory: Message[];
    setMessageHistory: (x: Message[]) => void;
}

export function Chat({ messageHistory, setMessageHistory }: Props) {
    const [isListening, setIsListening] = useState(true);
    const [textInput, setTextInput] = useState('');
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userGeneratedResponses, setUserGeneratedResponses] = useState(['', '', '']);
    const [question, setQuestion] = useState('');

    const { transcript, browserSupportsSpeechRecognition, finalTranscript, resetTranscript } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <p>Browser does not support speech recognition...</p>;
    }

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    };

    const generateResponses = (newTranscript: string) => {
        setUserGeneratedResponses(['', '', '']);
        generateUserResponses(newTranscript, [...messages, { content: newTranscript, role: 'user' }])
            .then(r => setUserGeneratedResponses(r))
            .catch(error => console.error('Error generating responses:', error));
    };

    const handleUserInputSubmit = () => {
        if (textInput !== '') {
            setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
            sendQuestionAnswerPair(`${question} ${textInput}`, "tableName");
            generateUserAudio(textInput)
                .then(tempURL => setAudioURL(tempURL))
                .catch(error => console.error('Error speaking:', error));
            setTextInput('');
        }
    };

    useEffect(() => {
        if (finalTranscript) {
            setMessages(prev => [...prev, { content: finalTranscript, role: 'user' }]);
            setQuestion(finalTranscript);
            generateResponses(finalTranscript);
            resetTranscript();
        }
    }, [finalTranscript]);

    useEffect(() => {
        setMessageHistory(messages);
    }, [messages]);

    useEffect(() => {
		if (isListening) {
			startListening();
		}
        else {
			SpeechRecognition.stopListening();
        }
    }, [isListening]);

    return (
        <div className={styles.app}>
            <div className={styles.container}>
                <div className={styles.mainView}>
                    <ChatWindow mode={'chat'} messages={messages} loading={isListening} transcript={transcript}/>
                </div>
                <RefreshButton handleRefresh={() => generateResponses(question)}/>
                <div className={styles.responseView}>
                    <Responses responses={userGeneratedResponses} setInputText={setTextInput}/>  
                </div>
                <div className={styles.footer}>
                    <Listen listen={isListening} toggleListen={() => setIsListening(prev => !prev)}/>
                    <InputBar inputText={textInput} setInput={setTextInput} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setIsListening={setIsListening}/>
                </div>
            </div>
        </div>
    );
}
