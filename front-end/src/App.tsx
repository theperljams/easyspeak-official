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
	const [listenSocket, setListenSocket] = useState<WebSocket | null>();
	const [speakSocket, setSpeakSocket] = useState<WebSocket | null>(null);
	const [transcription, setTranscription] = useState("");
	const [firstMessage, setFirstMessage] = useState(true);
	const [inputText, setInputText] = useState("");
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	function doListen() {
		console.log("doListen");
		if (!listenSocket) {
			const socket = new WebSocket(WEBSOCKET_URL + "/transcribe");

			socket.onerror = function (event) {
				console.error("WebSocket error:", event);
				alert("There was an error connecting to the transcription server");
			};

			setListenSocket(socket);
		}
	}

	function toggleListen() {
		console.log("toggleListen");
		setListen(!listen);
		setFirstMessage(true);
		doListen();
	}

	useEffect(() => {
		if (!listenSocket) {
			console.log("no listenSocket");
		}
		else {
			listenSocket.onmessage = (event) => {
				console.log("listen: ", listen);
				const transcriptionResult = event.data as string;
				if (listen) {
					// Functional update
					setTranscription(prevTranscription => prevTranscription + " " + transcriptionResult);
					listenSocket.send("ACK");

					setMessages((prevMessages) => {
						if (firstMessage) {
							// Update firstMessage state
							setFirstMessage(false);
							return [...prevMessages, { message: transcriptionResult, side: "left" }];
						}
						else {
							return [
								...prevMessages.slice(0, -1),
								{
									message: prevMessages[prevMessages.length - 1].message + " " + transcriptionResult,
									side: "left",
								},
							];
						}
					});
				}
				else {
					setTranscription("");
					listenSocket.send("ACK");
				}
			};
			console.log("firstMessage: ", firstMessage);
		}
	}, [listenSocket, firstMessage, listen]);
	// Include firstMessage in dependency array

	const [responses, setResponses] = useState(["", "", "", ""]);

	useEffect(() => {
		if (!listen && transcription != "") {
			console.log("in generate");
			// Clear responses when listen is false
			setResponses(["", "", "", ""]);
			generate(transcription)
				.then((r) => {
					setResponses(r);
				})
				.catch((error) => {
					console.error("Error generating responses:", error);
				});
		}
	}, [listen, transcription]);

	async function generate(voiceInput: string): Promise<string[]> {
		const res = await fetch(`${SERVER_URL}/query`, {
			method: "POST",
			// Assuming the server expects an array of questions
			body: JSON.stringify({ question: voiceInput }),
			headers: {
				"Content-Type": "application/json",
				"accept": "application/json",
			},
		});

		const data = await res.json() as string[];
		console.log("response: ", data);
		return data;
	}

	const speak = () => {
		setMessages(prevMessages => [...prevMessages, { message: inputText, side: "right" }]);
		setInputText("");

		// Store the socket reference for later use
		if (!speakSocket) {
			setSpeakSocket(new WebSocket(WEBSOCKET_URL + "/speak"));
		}
	};

	useEffect(() => {
		if (speakSocket) {
			console.log("speakSocket");
			speakSocket.onerror = function (event) {
				console.error("WebSocket error:", event);
				alert("There was an error connecting to the speech server");
			};

			speakSocket.onopen = (event) => {
				console.log("WebSocket connection opened:", event);

				// Send the question to the server
				const message = { question: inputText };
				speakSocket.send(JSON.stringify(message));
			};

			// Handle incoming audio data
			speakSocket.onmessage = (event) => {
				// Assuming audio data is already in ArrayBuffer format
				const audioData = event.data as ArrayBuffer;
				const audioBlob = new Blob([audioData], { type: "audio/wav" });
				const audioUrl = URL.createObjectURL(audioBlob);

				setAudioURL(audioUrl);
				speakSocket.send("ACK");
				console.log("Audio URL:", audioUrl);

				// socket.close();
			};

			speakSocket.onclose = function (event) {
				// Reset webSocket state to null when connection closes
				setSpeakSocket(null);
				setInputText("");

				if (event.wasClean) {
					console.log("WebSocket closed cleanly:", event);
				}
				else {
					console.log("WebSocket connection closed unexpectedly:", event);
				}
			};
		}
	}, [speakSocket, inputText]);

	const onInputChange = (newText: string) => {
		setInputText(newText);
	};

	return (
		<div className={styles.app}>
			<Listen listen={listen} toggleListen={toggleListen} />
			<div className={styles.mainView}>
				<Chat messages={messages} />
				<Responses responses={responses} setInputText={setInputText} />
			</div>
			<InputBar inputText={inputText} onInputChange={onInputChange} speak={speak} audioURL={audioURL} />
		</div>
	);
}
