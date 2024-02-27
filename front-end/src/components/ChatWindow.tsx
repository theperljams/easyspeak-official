import {ChatBubble} from './ChatBubble';
import styles from '../styles/ChatWindow.module.css';
import type {Message} from './Interfaces';
import {useEffect, useRef} from 'react';

interface Props {
	messages: Message[];
	loading: boolean;
	transcript: string;
	title: string;

}

// scroll to bottom on message submit

export function ChatWindow({ loading, messages, transcript, title }: Props) {
	// const scrollRef = useRef<null | HTMLDivElement>(null)

	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		// @ts-expect-error
		messagesEndRef.current!.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, loading]);

	return (
		<div className={styles.chat}>
			{/* <div className={styles.titleBar}>{title}</div> */}
			<div className={styles.messagesList}>
				{messages.map((message, index) => (
					<ChatBubble key={index} role={message.role} content={message.content} />
				))}
				{loading && <ChatBubble role="user" content={transcript != '' ? transcript : '...'} />}
			</div>
			<div className="footer" ref={messagesEndRef} />
		</div>
	);
}
