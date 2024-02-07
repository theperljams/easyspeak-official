import { useState, type FormEvent } from 'react';

import styles from './InputBar.module.css';
import pencil from '../assets/pencil.svg';
import paperAirplane from '../assets/paper-airplane.svg';

interface Props {
	inputText: string;
	setInput: (newText: string) => void;
	handleSubmitInput: () => void;
	audioURL: string | null;
}

// TODO: handle the input overflow, allow maybe 3-4 lines then make it scrollable

export function InputBar({ inputText, setInput, handleSubmitInput, audioURL }: Props) {
	const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		handleSubmitInput();
		setInput('');
	}

	return (
		<form className={styles.inputBar} onSubmit={onFormSubmit}>
			<button className={styles.button} type="button" onClick={() => console.log('edit')}>
				<img src={pencil} alt="icon" className={styles.buttonIcon} />
			</button>
			<input
				className={styles.textBox}
				type="text"
				value={inputText}
				onChange={(e) => {
					setInput(e.target.value);
				}}
				placeholder="Type anything here..."
			/>
			{
				// Conditionally render audio player
				audioURL != null && (
					<audio autoPlay key={audioURL}>
						<source src={audioURL} type="audio/mpeg" />
					</audio>
				)
			}
			<button className={styles.button} type="submit">
				<img src={paperAirplane} alt="icon" className={styles.buttonIcon} />
			</button>
		</form>
	);
}
