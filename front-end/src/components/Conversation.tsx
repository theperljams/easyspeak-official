import { useState } from "react";

import { ChatBubble } from "./ChatBubble.jsx";

interface Props {
	transcription: string;
}

/** Type for message, has a message and a side */
interface Message {
    message: string;
    side: "left" | "right";
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

export const addNewMessage = (newMessage: string, side: "left" | "right") => {
	setMessages((prevMessages) => [
		...prevMessages,
		{
			message: newMessage,
			side: side,
		},
	]);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Conversation ({ transcription }: Props) {
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
