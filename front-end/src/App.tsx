import { Listen } from "./components/Listen.js";
import { Chat } from "./components/Chat.js";
import { Responses } from "./components/Responses.js";
import { InputBar } from "./components/InputBar.js";

import styles from "./App.module.css";

export function App () {
	return (
		<div className={styles.app}>
			<Listen/>
			<div className={styles.mainView}>
				<Chat/>
				<Responses/>
			</div>
			<InputBar/>
		</div>
	);
}
