import { InputButton } from "./InputButton.js";

import styles from "./InputBar.module.css";
import pencil from "../../assets/pencil.svg";
import paperAirplane from "../../assets/paper-airplane.svg";

export function InputBar () {
	function openKeyboard () {
		alert("You should probably change this!");
	}
	function send () {
		alert("You should probably change this!");
	}

	return (
		<div className={styles.input_bar}>
			<InputButton icon={pencil} clicked={openKeyboard} />
			<input type="text" placeholder="Type anything here..." className={styles.text_box}/>
			<InputButton icon={paperAirplane} clicked={send} />
		</div>
	);
}
