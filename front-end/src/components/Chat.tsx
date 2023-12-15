import { useState } from "react";

import { ChatBubble } from "./ChatBubble";

import styles from "./Chat.module.css";

interface Message {
    message: string;
    side: "left" | "right";
}

export function Chat () {
	const [messages] = useState<Message[]>([
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
		<div className={styles.chat}>
			<div className={styles.titleBar}>
				Chat
			</div>
			<div className={styles.messagesList}>
				{messages.map((message, index) => (
					<ChatBubble key={index} side={message.side} message={message.message}/>
				))}
			</div>
		</div>
	);
}
