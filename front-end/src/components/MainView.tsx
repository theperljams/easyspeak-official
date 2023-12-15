import { Options } from "./Options.js";
import { InputBar } from "./InputBar.js";
import { Responses } from "./Responses.js";
import { Conversation } from "./Conversation.js";

import styles from "./MainView.module.css";

export function MainView () {
	return (
		<div className={styles.layout}>
			<div className={styles.grid_conversation}>
				<Conversation />
			</div>
			<div className={styles.grid_options}>
				<Options />
			</div>
			<div className={styles.grid_responses}>
				<Responses />
			</div>
			<div className={styles.grid_responsesLabel}>Responses</div>
			<InputBar/>
		</div>
	);
}
