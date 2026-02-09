import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";
import { ThreeDot } from "react-loading-indicators";

import styles from "./styles/Chat.module.css";
import { generateUserAudio, generateUserResponses, sendQuestionAnswerPair } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";
import QuickResponses from "./components/QuickResponses.js";

// Simple SVG Icons for arrows
const ChevronLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);

const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
);

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
    const [displayResponse, setDisplayResponse] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const RESPONSES_PER_PAGE = 3;

    const { finalTranscript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

    const totalPages = Math.ceil(responseQueue.length / RESPONSES_PER_PAGE);

    if (!browserSupportsSpeechRecognition) {
        return <p>Browser does not support speech recognition.</p>;
    }

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    };

    const generateResponses = (newTranscript: string) => {
        setIsGenerating(true);
        console.log("responseQueue: ", responseQueue);
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

    // --- Navigation Handlers ---
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    useEffect(() => {
        if (finalTranscript) {
            console.log(finalTranscript);
            setMessages(prev => [...prev, { content: finalTranscript, role: 'user' }]);
            setQuestion(finalTranscript);
            generateResponses(finalTranscript);
            resetTranscript();
        }
    }, [finalTranscript]);

    useEffect(() => {
        console.log("responseQueue: ", responseQueue);
        if (responseQueue.length == 0) {
            setDisplayResponse(true);
            setCurrentPage(0);
        }
        else if (textInput == '') {
            setDisplayResponse(false);
        }
        else {
            setDisplayResponse(true);
        }
        console.log("displayResponse: ", displayResponse);
        
        // Update current responses based on page
        const startIndex = currentPage * RESPONSES_PER_PAGE;
        const endIndex = startIndex + RESPONSES_PER_PAGE;
        setCurrResponses(responseQueue.slice(startIndex, endIndex));
        
    }, [responseQueue, displayResponse, textInput, currentPage]);


    const handleUserInputSubmit = () => {
        console.log('handle User input submit');
        if (textInput !== '') {
            // ... existing logic ...
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
                <div className={styles.loadingIndicator}>
                    {isGenerating ? (
                        <ThreeDot color="#007BFF" size="medium" text="" textColor="" />
                    ) : (
                        <RefreshButton handleRefresh={() => generateResponses(question)} />
                    )}
                </div>

                {/* Updated Response View with Arrows */}
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
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage === 0 || responseQueue.length === 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: currentPage === 0 ? 'default' : 'pointer',
                            opacity: currentPage === 0 ? 0.3 : 1
                        }}
                    >
                        <ChevronLeft />
                    </button>

                    <Responses
                        responses={currResponses}
                        setInputText={setTextInput}
                        isGenerating={isGenerating}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                    />

                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage >= totalPages - 1 || responseQueue.length === 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer',
                            opacity: currentPage >= totalPages - 1 ? 0.3 : 1
                        }}
                    >
                        <ChevronRight />
                    </button>
                </div>

                <InputBar inputText={textInput} setInput={setTextInput} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setIsListening={setIsListening} setDisplayResponses={setDisplayResponse} />
                <QuickResponses generateUserAudio={generateUserAudio} />
            </div>
        </div>
    );
}