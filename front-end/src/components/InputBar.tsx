import styles from "./InputBar.module.css";
import pencil from "../assets/pencil.svg";
import paperAirplane from "../assets/paper-airplane.svg";

interface Props {
	inputText: string;
	onInputChange: (newText: string) => void;
	speak: () => void;
	audioURL: string | null;
}

export function InputBar({ inputText, onInputChange, speak, audioURL }: Props) {
	function openKeyboard() {
		alert("You should probably change this!");
	}

	return (
		<div className={styles.inputBar}>
			<div className={styles.button} onClick={openKeyboard}>
				<img src={pencil} alt="icon" className={styles.buttonIcon} />
			</div>
			<input
				className={styles.textBox}
				type="text"
				value={inputText}
				onChange={(e) => {
					onInputChange(e.target.value);
				}}
				placeholder="Type anything here..."
			/>
			{
				// Conditionally render audio player
				audioURL && (
					<audio autoPlay key={audioURL}>
						<source src={audioURL} type="audio/mpeg" />
					</audio>
				)
			}
			<div className={styles.button} onClick={speak}>
				<img src={paperAirplane} alt="icon" className={styles.buttonIcon} />
			</div>
		</div>
	);
}
