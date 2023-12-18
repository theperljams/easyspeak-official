import styles from "./InputBar.module.css";
import pencil from "../assets/pencil.svg";
import paperAirplane from "../assets/paper-airplane.svg";

export function InputBar () {
	function openKeyboard () {
		alert("You should probably change this!");
	}
	function send () {
		alert("You should probably change this!");
	}

	return (
		<div className={styles.inputBar}>
			<div className={styles.button} onClick={openKeyboard}>
				<img src={pencil} alt="icon" className={styles.buttonIcon} />
			</div>
			<input className={styles.textBox} type="text" placeholder="Type anything here..."/>
			<div className={styles.button} onClick={send}>
				<img src={paperAirplane} alt="icon" className={styles.buttonIcon} />
			</div>
		</div>
	);
}
