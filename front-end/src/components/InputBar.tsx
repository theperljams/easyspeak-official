import { useState, type FormEvent } from 'react';

import styles from './InputBar.module.css';
import pencil from '../assets/pencil.svg';
import paperAirplane from '../assets/paper-airplane.svg';
import upArrowIcon from '../assets/arrow-up-square.svg';

interface Props {
	inputText: string;
	setInput: (newText: string) => void;
	handleSubmitInput: () => void;
	audioURL: string | null;
	setButton: () => void;
}

export function InputBar({ inputText, setInput, handleSubmitInput, audioURL, setButton }: Props) {
	const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		handleSubmitInput();
		setInput('');
	}
	
	const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
      setInput('');
    }
  };

	return (
		<form className={styles.inputBar} onSubmit={onFormSubmit}>
			<div className={styles.textContainer}>
				<textarea 
					className={styles.textBox} 
					name="input" 
					id="" 
					value={inputText}
					onKeyDown={onTextareaKeyDown}
					onChange={e => setInput(e.target.value)}/>
				{
					// Conditionally render audio player
					audioURL != null && (
						<audio autoPlay key={audioURL}>
							<source src={audioURL} type="audio/mpeg"/>
						</audio>
					)
				}
				<button className={styles.button} type="submit">
					<img src={upArrowIcon} alt="icon" className={styles.buttonIcon} />
				</button>
			</div>
		</form>
	);
}
