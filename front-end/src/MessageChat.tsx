// src/MessageChat.js

import { useState, useEffect } from "react";
import { Responses } from "./components/Responses.js";
import { ThreeDot } from "react-loading-indicators";
import styles from "./styles/Chat.module.css";
import { generateUserAudio, generateUserResponses, getLatestMessage, submitSelectedResponse } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";
import { InputBar } from "./components/InputBar.js";
import QuickResponses from "./components/QuickResponses.js";
import io from 'socket.io-client'; // Import Socket.IO client

interface Props {
  messageHistory: Message[];
  setMessageHistory: (x: Message[]) => void;
}

export function MessageChat({ messageHistory, setMessageHistory }: Props) {
  const [textInput, setTextInput] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [responseQueue, setResponseQueue] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [currResponses, setCurrResponses] = useState<string[]>([]);
  const [displayResponse, setDisplayResponse] = useState(true);
  const [latestMessage, setLatestMessage] = useState('');
  const [latestMessageId, setLatestMessageId] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Initialize Socket.IO client for Front End namespace
    const socket = io('http://localhost:3000/frontend'); // Connect to '/frontend' namespace

    // Listen for 'responsesGenerated' event from Back End
    socket.on('responsesGenerated', (data) => {
      const { message_id, responses } = data;
      setLatestMessageId(message_id);
      setCurrResponses(responses);
      setStatus('New responses received.');
      console.log('Received responsesGenerated:', data);
    });

    // Listen for acknowledgments and errors
    socket.on('ack', (data) => {
      setStatus(data.message);
      console.log('Acknowledgment from server:', data);
    });

    socket.on('responseSubmitted', (data) => {
      setStatus(data.message);
      console.log('Response submitted:', data);
    });

    socket.on('error', (data) => {
      setStatus(`Error: ${data.error}`);
      console.error('Socket.IO error:', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from Back End');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleResponseSelection = () => {
    console.log('Selected response:', textInput);
    if (textInput) {
      const socket = io('http://localhost:3000/frontend'); // Connect to '/frontend' namespace
      socket.emit('submitSelectedResponse', {
        message_id: latestMessageId,
        selected_response: textInput,
      });
      setStatus('Selected response submitted.');
      setCurrResponses([]);
      setLatestMessageId('');
      socket.disconnect(); // Disconnect after emitting
      console.log('Emitted submitSelectedResponse:', { message_id: latestMessageId, selected_response: textInput});
    }
  };

  useEffect(() => {
    if (responseQueue.length > 0) {
      setDisplayResponse(true);
      setCurrResponses(responseQueue.slice(0, 3));
    } else {
      setDisplayResponse(false);
    }
  }, [responseQueue]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.loadingIndicator}>
          {isGenerating ? (
            <ThreeDot color="#007BFF" size="medium" text="" textColor="" />
          ) : (
            <RefreshButton handleRefresh={() => {/* Optional: Implement refresh logic */}} />
          )}
        </div>
        <div className={styles.responseView}>
          <Responses responses={currResponses} setInputText={setTextInput} isGenerating={isGenerating} />
        </div>
        <InputBar
          inputText={textInput}
          setInput={setTextInput}
          handleSubmitInput={handleResponseSelection}
          audioURL={audioURL}
          setIsListening={setIsListening}
          setDisplayResponses={setDisplayResponse}
        />
        <QuickResponses generateUserAudio={generateUserAudio} />
        {status && <p className={styles.status}>{status}</p>}
      </div>
    </div>
  );
}
