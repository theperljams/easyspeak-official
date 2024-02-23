import styles from '../styles/ChatBubble.module.css';

interface Props {
	content: string;
	role: string;
}

export function ChatBubble({ content, role }: Props) {
	return (
		<>
			{role != 'system' && <div
				className={styles.messageBar + ' ' + ( role === 'assistant' ? styles.messageBar_left : styles.messageBar_right)}
			>
				<div
					className={styles.chatBubble + ' ' + ( role === 'assistant' ? styles.chatBubble_left : styles.chatBubble_right)}
				>
					{content}
				</div>
			</div>}
		</>
	);
}
