import { useState } from "react";

import styles from "./MainView.module.css";
import { Options } from "./Options.jsx";
import { Input } from "./Input.jsx";
import { Responses } from "./Responses.jsx";
import { Conversation } from "./Conversation.jsx";

export function MainView () {

	const [listen, setListen] = useState(false);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [transcription, setTranscription] = useState("");

	return (
		<div className={styles.layout}>
			<div className={styles.grid_input}>
				<Input />
			</div>
			<div className={styles.grid_conversation}>
				<Conversation transcription={transcription}/>
			</div>
			<div className={styles.grid_options}>
				<Options listen={listen} setListen={setListen} webSocket={webSocket} setWebSocket={setWebSocket} transcription={transcription} setTranscription={setTranscription}/>
			</div>
			<div className={styles.grid_responses}>
				<Responses />
			</div>
			<div className={styles.grid_responsesLabel}>Responses</div>
		</div>
	);
}
