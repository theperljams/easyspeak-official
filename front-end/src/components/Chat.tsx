import { useEffect } from 'react';

import { ChatBubble } from './ChatBubble';

import styles from './Chat.module.css';

export interface Message {
	message: string;
	side: 'left' | 'right';
}

interface Props {
	messages: Message[];
}

export function Chat({ messages }: Props) {
	const SCROLLABLE_AREA_ID = 'message-list';

	// Set the scrollbar to the bottom automatically when a new message is added
	useEffect(() => {
		const scrollableArea = document.getElementById(SCROLLABLE_AREA_ID);
		if (scrollableArea) {
			scrollableArea.scrollTop = scrollableArea.scrollHeight;
		}
		else {
			console.error('Could not find scrollabe area!');
		}
	}, [messages]);

	return (
		<div className={styles.chat}>
			<div className={styles.titleBar}>
				Chat
			</div>
			<div id={SCROLLABLE_AREA_ID} className={styles.messagesList}>
				{messages.map((message, index) => (
					<ChatBubble key={index} side={message.side} message={message.message} />
				))}
			</div>
		</div>
	);
}
