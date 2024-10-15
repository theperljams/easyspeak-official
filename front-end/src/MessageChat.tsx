import { useState, useEffect } from "react";
import axios from 'axios';
import { Responses } from "./components/Responses.js";
import { ThreeDot } from "react-loading-indicators";
import styles from "./styles/Chat.module.css";
import { generateUserResponses } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";

interface Props {
  messageHistory: Message[];
  setMessageHistory: (x: Message[]) => void;
}

export function Chat({ messageHistory, setMessageHistory }: Props) {
  const [latestMessage, setLatestMessage] = useState('');
  const [latestMessageId, setLatestMessageId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseQueue, setResponseQueue] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [currResponses, setCurrResponses] = useState<string[]>([]);
  const [displayResponse, setDisplayResponse] = useState(true);

  const generateResponses = (newMessage: string) => {
    setIsGenerating(true);
    generateUserResponses(newMessage, [...messages, { content: newMessage, role: 'client' }])
      .then(r => {
        setResponseQueue(r);
        setIsGenerating(false);
      })
      .catch(error => {
        console.error('Error generating responses:', error);
        setIsGenerating(false);
      });
  };

  useEffect(() => {
    const fetchLatestMessage = () => {
      axios.get('http://localhost:3000/get-latest-message')
        .then(response => {
          const { message, message_id } = response.data;
          if (message && message_id && message_id !== latestMessageId) {
            setLatestMessage(message);
            setLatestMessageId(message_id);
            setQuestion(message);
            setMessages(prev => [...prev, { content: message, role: 'client' }]);
            generateResponses(message);
          }
        })
        .catch(error => {
          console.error('Error fetching latest message:', error);
        });
    };

    fetchLatestMessage();
    const intervalId = setInterval(fetchLatestMessage, 5000);

    return () => clearInterval(intervalId);
  }, [latestMessageId]);

  useEffect(() => {
    if (responseQueue.length > 0) {
      setDisplayResponse(true);
      setCurrResponses(responseQueue.slice(0, 3));
    } else {
      setDisplayResponse(false);
    }
  }, [responseQueue]);

  useEffect(() => {
    setMessageHistory(messages);
  }, [messages]);

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
        <div className={styles.responseView}>
          {displayResponse && (
            <Responses
              responses={currResponses}
              handleUserInputSubmit={handleUserInputSubmit}
              isGenerating={isGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
}
