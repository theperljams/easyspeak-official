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
			message: "Hello, I am a chatbot. How can I help you?",
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
