import { useState, useEffect } from "react";

import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import type { Message } from "./components/Chat.jsx";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";
const SERVER_URL = "http://0.0.0.0:8000";


export function App() {
  const [listen, setListen] = useState(false);
  const [listenSocket, setListenSocket] = useState<WebSocket | null>(null);
  const [speakSocket, setSpeakSocket] = useState<WebSocket | null>(null);
  const [transcription, setTranscription] = useState("");
  const [firstMessage, setFirstMessage] = useState(true);
  const [inputText, setInputText] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  function doListen() {
    if (listen) {
      // If already listening, stop listening
      listenSocket?.close();
    } else {
      // If not listening, start listening
      const socket = new WebSocket(WEBSOCKET_URL + "/transcribe");

      socket.onerror = function (event) {
        console.error("WebSocket error:", event);
        alert("There was an error connecting to the transcription server");
      };

      // ... other socket event handlers

      setListenSocket(socket);
    }
  }

  function toggleListen() {
    setListen(!listen);
	setFirstMessage(true); 
    doListen();
  }

  useEffect(() => {
    if (listenSocket) {
      listenSocket.onmessage = (event) => {
        const transcriptionResult = event.data as string;
        setTranscription((prevTranscription) => prevTranscription + " " + transcriptionResult); // Functional update
        listenSocket.send("ACK");

        setMessages((prevMessages) => {
          if (firstMessage) {
            setFirstMessage(false); // Update firstMessage state
            return [...prevMessages, { message: transcriptionResult, side: "left" }];
          } else {
            return [
              ...prevMessages.slice(0, -1),
              {
                message: prevMessages[prevMessages.length - 1].message + " " + transcriptionResult,
                side: "left",
              },
            ];
          }
        });
      };

	  console.log("firstMessage: ", firstMessage);
    }
  }, [listenSocket, firstMessage]); // Include firstMessage in dependency array

  const [responses, setResponses] = useState([
	"Doing well, thanks! How about yourself?",
	"I'm great, full of energy today!",
	"Not bad, just taking things one day at a time.",
	"Feeling fantastic, so productive!",
]);

useEffect(() => {
	if (!listen && !firstMessage) {
	  console.log("in generate")
	  setResponses([]); // Clear responses when listen is false
	  Promise.all([generate(transcription), generate(transcription), generate(transcription), generate(transcription)])
		.then((responses) => {
		  setResponses(responses);
		})
		.catch((error) => {
		  console.error("Error generating responses:", error);
		});
	}
  }, [listen, firstMessage]);
  

// useEffect(() => {
// 	// Call generate when listen changes to false (or your desired trigger condition)
// 	if (!listen) {
// 	  setResponses([]); // Clear responses when listen is false
// 	  generate(transcription)
// 		.then((newResponse) => {
// 		  setResponses((prevResponses) => [...prevResponses, newResponse]); // Update responses in a separate effect
// 		})
// 		.catch((error) => {
// 		  // Handle errors during generation
// 		  console.error("Error generating response:", error);
// 		});
// 	}
//   }, [listen]); // Adjust the dependency array based on your trigger
  
  async function generate(voiceInput: string): Promise<string> {
	try {
		const res = await fetch(`${SERVER_URL}/query`, {
			method: "POST",
			body: JSON.stringify({ question: voiceInput }),
			headers: {
				"Content-Type": "application/json",
				accept: "application/json",
			},
		});

		const data = await res.text();
		console.log(res);
		return data;
	} catch (error) {
	  throw error; // Rethrow the error for handling in the useEffect
	}
  }
  

// async function generate (voiceInput: string, index: number): Promise<void> {
// 	try {
// 		const res = await fetch(`${SERVER_URL}/query`, {
// 			method: "POST",
// 			body: JSON.stringify({ question: voiceInput }),
// 			headers: {
// 				"Content-Type": "application/json",
// 				accept: "application/json",
// 			},
// 		});

// 		const data = await res.text();
// 		console.log(res);

// 		if (res.status === 200) {
// 			setResponses((prevResponses) => {
// 				const newResponses = [...prevResponses];
// 				newResponses[index] = data;
// 				return newResponses;
// 			});
// 		}
// 		else {
// 			setResponses((prevResponses) => {
// 				const newResponses = [...prevResponses];
// 				newResponses[index] = "I don't know";
// 				return newResponses;
// 			});
// 		}
// 	}
// 	catch (error) {
// 		console.error("Error fetching response:", error);
// 	}
// }

const speak = () => {
	setMessages((prevMessages) => [...prevMessages, { message: inputText, side: "right" }]);
  
	// Store the socket reference for later use
	setSpeakSocket(new WebSocket(WEBSOCKET_URL + "/speak"));
  };
  
  useEffect(() => {
	const socket = speakSocket;
  
	if (socket) {
	  socket.onerror = function (event) {
		console.error("WebSocket error:", event);
		alert("There was an error connecting to the speech server");
	  };
  
	  socket.onopen = (event) => {
		console.log("WebSocket connection opened:", event);
  
		// Send the question to the server
		const message = { question: inputText };
		socket.send(JSON.stringify(message));
	  };
  
	  socket.onmessage = (event) => {
		// Handle incoming audio data
		const audioData = event.data; // Assuming audio data is already in ArrayBuffer format
		const audioBlob = new Blob([audioData], { type: "audio/wav" });
		const audioUrl = URL.createObjectURL(audioBlob);
  
		setAudioURL(audioUrl);
		console.log("Audio URL:", audioUrl);
  
		// Close the WebSocket connection after receiving the audio
		socket.close();
	  };
  
	  socket.onclose = function (event) {
		// Reset webSocket state to null when connection closes
		setSpeakSocket(null);
		setInputText("");
  
		if (event.wasClean) {
		  console.log("WebSocket closed cleanly:", event);
		} else {
		  console.log("WebSocket connection closed unexpectedly:", event);
		}
	  };
	}
  }, [speakSocket, inputText]); 
  


  return (
    <div className={styles.app}>
      <Listen listen={listen} toggleListen={toggleListen} />
      <div className={styles.mainView}>
        <Chat messages={messages} />
        <Responses responses={responses} setInputText={setInputText}/>
      </div>
      <InputBar inputText={inputText} speak={speak} audioURL={audioURL}/>
    </div>
  );
}
