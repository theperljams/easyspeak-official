import { useState, useEffect } from "react";

import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import type { Message } from "./components/Chat.jsx";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";

export function App() {
  const [listen, setListen] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [transcription, setTranscription] = useState("");
  const [firstMessage, setFirstMessage] = useState(true); // Manage firstMessage in state
  const [messages, setMessages] = useState<Message[]>([
    {
      message: "How are you doing?",
      side: "left",
    },
    {
      message: "Doing well, thanks! How about yourself?",
      side: "right",
    },
  ]);

  function doListen() {
    if (listen) {
      // If already listening, stop listening
      webSocket?.close();
    } else {
      // If not listening, start listening
      const socket = new WebSocket(WEBSOCKET_URL + "/transcribe");

      socket.onerror = function (event) {
        console.error("WebSocket error:", event);
        alert("There was an error connecting to the transcription server");
      };

      // ... other socket event handlers

      setWebSocket(socket);
    }
  }

  function toggleListen() {
    setListen(!listen);
	setFirstMessage(true); 
    doListen();
  }

  useEffect(() => {
    if (webSocket) {
      webSocket.onmessage = (event) => {
        const transcriptionResult = event.data as string;
        setTranscription((prevTranscription) => prevTranscription + " " + transcriptionResult); // Functional update
        webSocket.send("ACK");

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
    }
  }, [webSocket, firstMessage]); // Include firstMessage in dependency array

  return (
    <div className={styles.app}>
      <Listen listen={listen} toggleListen={toggleListen} />
      <div className={styles.mainView}>
        <Chat messages={messages} />
        <Responses />
      </div>
      <InputBar />
    </div>
  );
}
