import {ChatBubble} from './ChatBubble';
import styles from '../styles/ChatWindow.module.css';
import type { Message } from './Interfaces';
import { useEffect, useRef } from 'react';


interface Props {
	messages: Message[];
	loading: Boolean;
	transcript: string;
	mode: 'chat' | 'training';
	introMessages?: Message[];
}

// scroll to bottom on message submit

export function ChatWindow({ loading, messages, transcript, introMessages, mode}: Props) {
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
				{introMessages && <>
					{introMessages.map((message, index) => (
						<ChatBubble mode='training' key={index} role={message.role} content={message.content} />))}
				</>}
				{messages.map((message, index) => (
					<ChatBubble mode={mode} key={index} role={message.role} content={message.content} />))}
				{loading && <>
					{mode == 'training' ? 
						<ChatBubble mode={mode} role={'assistant'} content={transcript != '' ? transcript : '...' } />
						:
						<ChatBubble mode={mode} role={'user'} content={transcript != '' ? transcript : '...' } />}
				</>}
				<div ref={messagesEndRef} />
			</div>
			<div className="footer"/>
		</div>
	);
}