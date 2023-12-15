import { useState } from "react";

import styles from "./MainView.module.css";
import { Options } from "./Options.jsx";
import { Input } from "./Input.jsx";
import { Responses } from "./Responses.jsx";
import type { Message } from "./Conversation.jsx";
import { Conversation } from "./Conversation.jsx";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";

export function MainView () {
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

			socket.onopen = function (event) {
				console.log("WebSocket connection opened:", event);
			};

			setMessages((prevMessages) => [
				...prevMessages,
				{
					message: transcription,
					side: "left",
				},
			]);

			socket.onmessage = function (event) {
				// Handle incoming transcription results
				const transcriptionResult = event.data as string;
				console.log("Transcription Result:", transcriptionResult);
				setTranscription(transcription + " " + transcriptionResult);

				// Send acknowledgement back to server
				socket.send("ACK");
			};

			socket.onclose = function (event) {
				if (event.wasClean) {
					console.log("WebSocket closed cleanly:", event);
				}
				else {
					console.log("WebSocket connection closed unexpectedly:", event);
				}
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
			message: "I am a chatbot",
			side: "left",
		},
		{
			message: "I would like to know more about chatbots",
			side: "right",
		},
		{
			message: "Chatbots are cool",
			side: "left",
		},
	]);

	return (
		<div className={styles.layout}>
			<div className={styles.grid_input}>
				<Input />
			</div>
			<div className={styles.grid_conversation}>
				<Conversation messages={messages}/>
			</div>
			<div className={styles.grid_options}>
				<Options listen={listen} toggleListen={toggleListen}/>
			</div>
			<div className={styles.grid_responses}>
				<Responses />
			</div>
			<div className={styles.grid_responsesLabel}>Responses</div>
		</div>
	);
}
