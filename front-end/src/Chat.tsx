import { useState, useEffect } from "react";
import { useWhisper } from '@chengsokdara/use-whisper';
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./styles/Chat.module.css";
import { generateUserAudio, generateUserResponses, sendQuestionAnswerPair, sendLogToServer } from "./Api.js";
import type { Message } from "./components/Interfaces.js";
import { RefreshButton } from "./components/RefreshButton.js";
import QuickResponses from "./components/QuickResponses.js";

interface Props {
  messageHistory: Message[];
  setMessageHistory: (x: Message[]) => void;
}

export function Chat({ messageHistory, setMessageHistory }: Props) {
  const [textInput, setTextInput] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseQueue, setResponseQueue] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [currResponses, setCurrResponses] = useState<string[]>([]);
  const [displayResponse, setDisplayResponse] = useState(true);

  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,
    error,
  } = useWhisper({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY!
  });

  useEffect(() => {
    console.log("Recording:", recording);
    console.log("Speaking:", speaking);
    console.log("Transcribing:", transcribing);
    console.log("Transcript:", transcript.text);
    if (error) {
      console.error("Error:", error);
    }
  }, [recording, speaking, transcribing, transcript, error]);

  return (
    <div>
      <p>Recording: {recording ? 'Yes' : 'No'}</p>
      <p>Speaking: {speaking ? 'Yes' : 'No'}</p>
      <p>Transcribing: {transcribing ? 'Yes' : 'No'}</p>
      <p>Transcribed Text: {transcript.text}</p>
      <button onClick={startRecording}>Start</button>
      <button onClick={pauseRecording}>Pause</button>
      <button onClick={stopRecording}>Stop</button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );

  // const {
  //   recording,
  //   speaking,
  //   transcribing,
  //   transcript,
  //   pauseRecording,
  //   startRecording,
  //   stopRecording,
  // } = useWhisper({
  //   apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  //   nonStop: true,
  //   stopTimeout: 5000,
  // });

  // const generateResponses = (newTranscript: string) => {
  //   setIsGenerating(true);
  //   sendLogToServer("responseQueue: " + JSON.stringify(responseQueue));
  //   console.log("responseQueue: " + JSON.stringify(responseQueue));
  //   generateUserResponses(newTranscript, [...messages, { content: newTranscript, role: 'user' }])
  //     .then(r => {
  //       setResponseQueue(r); // Queue the responses
  //       setIsGenerating(false);
  //     })
  //     .catch(error => {
  //       sendLogToServer('Error generating responses: ' + error);
  //       console.log('Error generating responses: ' + error);
  //       setIsGenerating(false);
  //     });
  // };

  // useEffect(() => {
  //   if (recording) {
  //     sendLogToServer('Recording started');
  //     console.log('Recording started');
  //   }
  // }, [recording]);

  // useEffect(() => {
  //   console.log("in useEffect")
  //   if (transcript.text) {
  //     sendLogToServer(transcript.text);
  //     console.log(transcript.text);
  //     let transcriptText: string  = transcript.text;
  //     setMessages(prev => [...prev, { content: transcriptText, role: 'user' }]);
  //     setQuestion(transcript.text);
  //     generateResponses(transcript.text);
  //   }
  // }, [transcribing]);

  // useEffect(() => {
  //   sendLogToServer("responseQueue: " + JSON.stringify(responseQueue));
  //   console.log("responseQueue: " + JSON.stringify(responseQueue));
  //   if (responseQueue.length === 0) { 
  //     setDisplayResponse(true);
  //   } else if (textInput === '') {
  //     setDisplayResponse(false);
  //   } else {
  //     setDisplayResponse(true);
  //   }
  //   sendLogToServer("displayResponse: " + displayResponse);
  //   console.log("displayResponse: " + displayResponse);
  //   if (displayResponse) {
  //     setCurrResponses(responseQueue);
  //   }
  //   if (responseQueue.length > 0 && textInput !== '') {
  //     setCurrResponses(responseQueue);
  //   }
  // }, [responseQueue, displayResponse, textInput]);

  // const handleUserInputSubmit = () => {
  //   sendLogToServer('handle User input submit');
  //   console.log('handle User input submit');
  //   if (textInput !== '') {
  //     sendLogToServer('text input: ' + textInput);
  //     console.log('text input: ' + textInput);
  //     setMessages(prev => [...prev, { content: textInput, role: 'assistant' }]);
  //     let tableName = "";
  //     let name1 = "";
  //     let name2 = "";
  //     if (localStorage.getItem('user_id') === "seth@alscrowd.org") {
  //       tableName = "sethxamy";
  //       name1 = "Amy: ";
  //       name2 = "Seth: ";
  //     } else {
  //       tableName = "short";
  //       name1 = "Q: ";
  //       name2 = "A: ";
  //     }
  //     sendQuestionAnswerPair(`${name1}${question} ${name2}${textInput}`, tableName);

  //     if (responseQueue.length > 3) {
  //       sendLogToServer(JSON.stringify(responseQueue));
  //       console.log(JSON.stringify(responseQueue));
  //       responseQueue.splice(0, 3);
  //       sendLogToServer("responseQueue: " + JSON.stringify(responseQueue));
  //       console.log("responseQueue: " + JSON.stringify(responseQueue));
  //       setCurrResponses(responseQueue.slice(0, 3));
  //       sendLogToServer("currResponses: " + JSON.stringify(currResponses));
  //       console.log("currResponses: " + JSON.stringify(currResponses));
  //     }
  //     setDisplayResponse(true);
  //     generateUserAudio(textInput)
  //       .then(tempURL => {
  //         sendLogToServer('audio URL: ' + tempURL);
  //         console.log('audio URL: ' + tempURL);
  //         setAudioURL(tempURL);
  //         setTextInput('');
  //       })
  //       .catch(error => {
  //         sendLogToServer('Error speaking: ' + error);
  //         console.log('Error speaking: ' + error);
  //       });
  //   }
  // };

  // useEffect(() => {
  //   setMessageHistory(messages);
  // }, [messages]);

  // return (
  //   <div className={styles.app}>
  //     <div className={styles.container}>
  //       <RefreshButton handleRefresh={() => generateResponses(question)} />
  //       <div className={styles.responseView}>
  //         <Responses responses={currResponses} setInputText={setTextInput} isGenerating={isGenerating} />  
  //       </div>
  //       <InputBar inputText={textInput} setInput={setTextInput} handleSubmitInput={handleUserInputSubmit} audioURL={audioURL} setIsListening={setDisplayResponse} setDisplayResponses={setDisplayResponse} />
  //       <QuickResponses generateUserAudio={generateUserAudio} />
  //     </div>
  //   </div>
  // );
}
