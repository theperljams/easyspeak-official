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
	return (
		<div className={styles.chat}>
			<div className={styles.titleBar}>
				Chat
			</div>
			<div className={styles.messagesList}>
				{messages.map((message, index) => (
					<ChatBubble key={index} side={message.side} message={message.message} />
				))}
			</div>
		</div>
	);
}
