// Chat.tsx

import { useState, useEffect } from 'react';
import { Responses } from './components/Responses.js';
import { InputBar } from './components/InputBar.js';
import { ThreeDot } from 'react-loading-indicators';

import styles from './styles/Chat.module.css';
import {
  generateUserAudio,
  generateUserResponses,
  sendQuestionAnswerPair,
} from './Api.js';
import type { Message } from './components/Interfaces.js';
import { RefreshButton } from './components/RefreshButton.js';
import QuickResponses from './components/QuickResponses.js';
import { AudioTranscriber } from './AudioTranscriber';

interface Props {
  messageHistory: Message[];
  setMessageHistory: (x: Message[]) => void;
}

export function Chat({ messageHistory, setMessageHistory }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseQueue, setResponseQueue] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [currResponses, setCurrResponses] = useState<string[]>([]);
  const [displayResponse, setDisplayResponse] = useState(true);

  const generateResponses = (newTranscript: string) => {
    setIsGenerating(true);
    generateUserResponses(newTranscript, [
      ...messages,
      { content: newTranscript, role: 'user' },
    ])
      .then((r) => {
        setResponseQueue(r); // Queue the responses
        setIsGenerating(false);
      })
      .catch((error) => {
        console.error('Error generating responses:', error);
        setIsGenerating(false);
      });
  };

  const handleTranscript = (transcript: string) => {
    setMessages((prev) => [...prev, { content: transcript, role: 'user' }]);
    setQuestion(transcript);
    generateResponses(transcript);
  };

  useEffect(() => {
    if (responseQueue.length === 0) {
      setDisplayResponse(true);
    } else if (textInput === '') {
      setDisplayResponse(false);
    } else {
      setDisplayResponse(true);
    }
    if (displayResponse) {
      setCurrResponses(responseQueue);
    }
    if (responseQueue.length > 0 && textInput !== '') {
      setCurrResponses(responseQueue);
    }
  }, [responseQueue, displayResponse, textInput]);

  const handleUserInputSubmit = () => {
    if (textInput !== '') {
      setMessages((prev) => [
        ...prev,
        { content: textInput, role: 'assistant' },
      ]);
      let tableName = '';
      let name1 = '';
      let name2 = '';
      if (localStorage.getItem('user_id') === 'email@email.com') {
        tableName = 'sethxamy';
        name1 = 'Amy: ';
        name2 = 'Seth: ';
      } else {
        tableName = 'short';
        name1 = 'Q: ';
        name2 = 'A: ';
      }
      sendQuestionAnswerPair(
        `${name1}${question} ${name2}${textInput}`,
        tableName
      );

      if (responseQueue.length > 3) {
        responseQueue.splice(0, 3);
        setCurrResponses(responseQueue.slice(0, 3));
      }
      setDisplayResponse(true);
      generateUserAudio(textInput)
        .then((tempURL) => {
          setAudioURL(tempURL);
          setTextInput('');
        })
        .catch((error) => {
          console.error('Error speaking:', error);
        });
    }
  };

  useEffect(() => {
    setMessageHistory(messages);
  }, [messages]);

  return (
    <div className={styles.app}>
      {/* Include the AudioTranscriber component */}
      <AudioTranscriber
        onTranscript={handleTranscript}
        setIsListening={setIsListening}
      />

      <div className={styles.container}>
        <div className={styles.loadingIndicator}>
          {isGenerating ? (
            <ThreeDot color="#007BFF" size="medium" text="" textColor="" />
          ) : (
            <RefreshButton handleRefresh={() => generateResponses(question)} />
          )}
        </div>
        <div className={styles.responseView}>
          <Responses
            responses={currResponses}
            setInputText={setTextInput}
            isGenerating={isGenerating}
          />
        </div>
        <InputBar
          inputText={textInput}
          setInput={setTextInput}
          handleSubmitInput={handleUserInputSubmit}
          audioURL={audioURL}
          setIsListening={setIsListening}
          setDisplayResponses={setDisplayResponse}
        />
        <QuickResponses generateUserAudio={generateUserAudio} />
      </div>
    </div>
  );
}
