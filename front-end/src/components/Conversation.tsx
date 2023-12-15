import { ChatBubble } from "./ChatBubble.jsx";

/** Type for message, has a message and a side */
export interface Message {
	message: string;
	side: "left" | "right";
}

interface Props {
	messages: Message[];
}

export function Conversation ({ messages }: Props) {
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
