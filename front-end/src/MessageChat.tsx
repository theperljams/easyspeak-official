import { useState, useEffect, useRef } from "react";
import { Responses } from "./components/Responses.js";
import { ThreeDot } from "react-loading-indicators";
import styles from "./styles/Chat.module.css";
import { generateUserAudio } from "./Api.js";
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
  const [currResponses, setCurrResponses] = useState<string[]>([]);
  const [displayResponse, setDisplayResponse] = useState(true);
  const [isListening, setIsListening] = useState(true);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  // useRef to store the socket instance
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Socket.IO client for Front End namespace only once
    socketRef.current = io('http://localhost:3000/frontend'); // Connect to '/frontend' namespace

    // Listen for 'responsesGenerated' event from Back End
    socketRef.current.on('responsesGenerated', (data) => {
      const { responses, currMessage } = data;
      setCurrResponses(responses);
      setMessage(currMessage);
      setStatus('New responses received.');
      console.log('Received responsesGenerated:', data);
    });

    // Listen for acknowledgments and errors
    socketRef.current.on('ack', (data) => {
      setStatus(data.message);
      console.log('Acknowledgment from server:', data);
    });

    socketRef.current.on('responseSubmitted', (data) => {
      setStatus(data.message);
      console.log('Response submitted:', data);
    });

    socketRef.current.on('error', (data) => {
      setStatus(`Error: ${data.error}`);
      console.error('Socket.IO error:', data);
    });

    // Handle disconnection
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Back End');
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleResponseSelection = () => {
    console.log('Selected response:', textInput);
    if (textInput) {
      // Use the existing socket connection to emit the event
      socketRef.current.emit('submitSelectedResponse', {
        selected_response: textInput,
        currMessage: message
      });
      setStatus('Selected response submitted.');
      setCurrResponses([]);
      console.log('Emitted submitSelectedResponse:', { selected_response: textInput });
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
      </div>
    </div>
  );
}
