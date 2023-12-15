import { useState } from "react";

import { ChatBubble } from "./ChatBubble.js";

/** Type for message, has a message and a side */
interface Message {
    message: string;
    side: "left" | "right";
}

export function Conversation () {
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
		<div style={{
			display: "flex",
			flexDirection: "column",
			justifyContent: "flex-start",
			width: "100%",
			padding: "20px",
			gap: "15px",
			height: "100%",
			boxSizing: "border-box",
		}}>
			{messages.map((message, index) => (
				<ChatBubble key={index} side={message.side} message={message.message}/>
			))}
		</div>
	);
}
