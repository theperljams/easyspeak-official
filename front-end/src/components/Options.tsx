import styles from "./Options.module.css";
import VolumeHigh from "../assets/volume-high-solid.svg";
import VolumeMute from "../assets/volume-xmark-solid.svg";
import { addNewMessage } from "./Conversation";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";

interface Props {
  listen: boolean;
  setListen: (val: boolean) => void;
  webSocket: WebSocket | null;
  setWebSocket: (val: WebSocket | null) => void;
  transcription: string;
  setTranscription: (val: string) => void;
}

export function Options ({
	listen,
	setListen,
	webSocket,
	setWebSocket,
	transcription,
	setTranscription,
}: Props) {

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

			addNewMessage(transcription, "left");

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

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "left",
				width: "100%",
				height: "100%",
				gap: "10px",
			}}
		>
			<div
				style={{
					backgroundColor: "#007AFF",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "10px",
					fontSize: ".5em",
				}}
				onClick={toggleListen}
			>
				<span
					style={{
						userSelect: "none",
						minWidth: "250px",
						cursor: "pointer",
					}}
				>
					<img
						style={{
							filter: "color(white)",
						}}
						src={listen ? VolumeHigh : VolumeMute}
						width="30px"
						alt="volume high"
					/>
          &nbsp;
          Listen: {listen ? "On" : "Off"}
				</span>
			</div>

			<div
				className={styles.vertically_centered_children_column}
				style={{
					textAlign: "center",
					width: "100%",
				}}
			>
        Chat
			</div>
		</div>
	);
}
