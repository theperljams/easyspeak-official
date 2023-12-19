import { useState } from "react";

import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import type { Message } from "./components/Chat.jsx";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";

export function App () {
	const [listen, setListen] = useState(false);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [transcription, setTranscription] = useState("");

	function doListen () {
		if (listen) {
			// If already listening, stop listening
			webSocket?.close();
		}
		else {
			// If not listening, start listening
			const socket = new WebSocket(WEBSOCKET_URL + "/transcribe");

			socket.onerror = function (event) {
				console.error("WebSocket error:", event);
				alert("There was an error connecting to the transcription server");
			};

			socket.onopen = function (event) {
				console.log("WebSocket connection opened:", event);

				setMessages((prevMessages) => [
					...prevMessages,
					{
						message: transcription,
						side: "left",
					},
				]);
			};

			socket.onmessage = function (event) {
				// Handle incoming transcription results
				const transcriptionResult = event.data as string;
				console.log("Transcription Result:", transcriptionResult);
				setTranscription(transcription + " " + transcriptionResult);

				// Send acknowledgement back to server
				socket.send("ACK");
			};

			socket.onclose = function () {
				setListen(false);
			};

			setWebSocket(socket);
		}
	}

	function toggleListen () {
		setListen(!listen);
		doListen();
	}

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

	return (
		<div className={styles.app}>
			<Listen listen={listen} toggleListen={toggleListen}/>
			<div className={styles.mainView}>
				<Chat messages={messages}/>
				<Responses/>
			</div>
			<InputBar/>
		</div>
	);
}
