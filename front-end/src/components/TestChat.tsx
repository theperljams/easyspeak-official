
import {ChatBubble} from './ChatBubble';
import styles from '../styles/ChatWindow.module.css';
import type { Message } from './Interfaces';
import { useEffect, useRef } from 'react';


interface Props {
	messages: Message[];
    mode: 'chat' | 'training';
}

export function TestChat({ messages, mode}: Props) {
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		// @ts-expect-error
		messagesEndRef.current!.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, ]);
  
	return (
		<div className={styles.chat}>
			{/* <div className={styles.titleBar}>{title}</div> */}
			<div className={styles.messagesList}>
				{messages.map((message, index) => (
					<ChatBubble mode={mode} key={index} role={message.role} content={message.content} />))}
				<div ref={messagesEndRef} />
			</div>
			<div className="footer"/>
		</div>
	);
}
