import styles from '../styles/ChatBubble.module.css';

interface Props {
	content: string;
	role: string;
	mode: string;
}

export function ChatBubble({ content, role, mode }: Props) {
	return (
		<> {role !== 'system' &&
		<>
			{mode == 'training' ?
				<div className={styles.messageBar + ' ' + (role === 'assistant' ? styles.messageBar_left : styles.messageBar_right)}>
					<div className={styles.chatBubble + ' ' + (role === 'assistant' ? styles.chatBubble_left : styles.chatBubble_right)}>
						{content}
					</div>
				</div>
				:
				
				<div className={styles.messageBar + ' ' + (role === 'user' ? styles.messageBar_left : styles.messageBar_right)}>
					<div className={styles.chatBubble + ' ' + (role === 'user' ? styles.chatBubble_left : styles.chatBubble_right)}>
						{content}
					</div>
				</div>}
		</>}
		</>
	);
}
