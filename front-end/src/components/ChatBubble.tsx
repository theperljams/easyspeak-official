import styles from './ChatBubble.module.css';

interface Props {
	side: 'left' | 'right';
	message: string;
}

export function ChatBubble({ side, message }: Props) {
	return (
		<div
			className={styles.messageBar + ' ' + (side === 'left' ? styles.messageBar_left : styles.messageBar_right)}
		>
			<div
				className={styles.chatBubble + ' ' + (side === 'left' ? styles.chatBubble_left : styles.chatBubble_right)}
			>
				{message}
			</div>
		</div>
	);
}
