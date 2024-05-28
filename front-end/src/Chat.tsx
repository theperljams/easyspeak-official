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
import QuickResponses from "./components/QuickResponses.js";
import { text } from "stream/consumers";

interface Props {
    messageHistory: Message[];
    setMessageHistory: (x: Message[]) => void;
}

export function Chat({ messageHistory, setMessageHistory }: Props) {
    const [isListening, setIsListening] = useState(true);
    const [textInput, setTextInput] = useState('');
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [responseQueue, setResponseQueue] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [question, setQuestion] = useState('');
    const [currResponses, setCurrResponses] = useState<string[]>([]);
    const [displayResponse, setDisplayResponse] = useState(false);

    const {finalTranscript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <p>Browser does not support speech recognition.</p>;
    }

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    };

    const generateResponses = (newTranscript: string) => {
        setIsGenerating(true);
        console.log("generate: ", responseQueue);
        generateUserResponses(newTranscript, [...messages, { content: newTranscript, role: 'user' }])
            .then(r => {
                setResponseQueue(r); // Queue the responses
                setIsGenerating(false);
            })
            .catch(error => {
                console.error('Error generating responses:', error);
                setIsGenerating(false);
            });
    };

    useEffect(() => {
        if (finalTranscript) {
            setMessages(prev => [...prev, { content: finalTranscript, role: 'user' }]);
            setQuestion(finalTranscript);
            generateResponses(finalTranscript);
            if (responseQueue.length == 0) { 
                setDisplayResponse(true);
            }
            else if (textInput == '') {
                setDisplayResponse(false);
            }
            else {
                setDisplayResponse(true);
            }
            console.log("displayResponse: ", displayResponse);
            if (displayResponse) {
                setCurrResponses(responseQueue);
            }
            resetTranscript();
        }
      
        if (responseQueue.length > 0 && textInput != '') {
            setCurrResponses(responseQueue);
        }
    }, [finalTranscript, displayResponse, textInput]);


    const handleUserInputSubmit = () => {
        console.log('handle User input submit');
        if (textInput !== '') {
            console.log('text input:', textInput);
            setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
            let tableName = "";
            let name1 = "";
            let name2 = "";
            if (localStorage.getItem('user_id') === "seth@alscrowd.org") {
                tableName = "sethxamy";
                name1 = "Amy: ";
                name2 = "Seth: ";
            } else {
                tableName = "short";
                name1 = "Q: ";
                name2 = "A: ";
            }
            sendQuestionAnswerPair(`${name1}${question} ${name2}${textInput}`, tableName);

            if (responseQueue.length > 3) {
                console.log(responseQueue);
                responseQueue.splice(0,3);
                console.log("responseQueue: ", responseQueue);
                setCurrResponses(responseQueue.slice(0,3));
                console.log("currResponses: ", currResponses);
            }
            setDisplayResponse(true);
            generateUserAudio(textInput)
                .then(tempURL => {
                    console.log('audio URL:', tempURL);
                    setAudioURL(tempURL);
                    setTextInput('');
                })
                .catch(error => {
                    console.error('Error speaking:', error);
                });
        }
    };

    useEffect(() => {
        setMessageHistory(messages);
    }, [messages]);

    useEffect(() => {
        if (isListening) {
            startListening();
        } else {
            SpeechRecognition.stopListening();
        }
    }, [isListening]);

    return (
        <div className={styles.app}>
            <div className={styles.container}>
                <RefreshButton handleRefresh={() => generateResponses(question)}/>
                <div className={styles.responseView}>
                    <Responses responses={currResponses} setInputText={setTextInput} isGenerating={isGenerating}/>  
                </div>
                <InputBar inputText={textInput} setInput={setTextInput} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setIsListening={setIsListening} setDisplayResponses={setDisplayResponse}/>
                <QuickResponses generateUserAudio={generateUserAudio}/>
            </div>
        </div>
    );
}
