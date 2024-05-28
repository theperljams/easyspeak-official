import React, { useState } from 'react';
import styles from '../styles/QuickResponses.module.css';

interface QuickResponsesProps {
	generateUserAudio: (message: string) => Promise<string>;
}

const QuickResponses: React.FC<QuickResponsesProps> = ({ generateUserAudio }) => {
	const [audioUrl, setAudioUrl] = useState<string>("");

	const handleButtonClick = async (message: string) => {
		try {
			const url = await generateUserAudio(message);
			setAudioUrl(url);
			playAudio(url);
		} catch (error) {
			console.error("Error generating or playing audio:", error);
		}
	};

	const playAudio = (url: string) => {
		const audio = new Audio(url);
		audio.play().catch(error => console.error("Error playing the audio:", error));
	};

	return (
		<div className={styles.container}>
			<button className={styles.button} onClick={() => handleButtonClick('Yes')}>Yes</button>
			<button className={styles.button} onClick={() => handleButtonClick('No')}>No</button>
			<button className={styles.button} onClick={() => handleButtonClick('Say It Again')}>Say It Again</button>
		</div>
	);
};

export default QuickResponses;
