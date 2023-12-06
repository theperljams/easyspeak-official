import styles from "./MainView.module.css";
import { Options } from "./Options.jsx";
import { Input } from "./Input.jsx";
import { Responses } from "./Responses.jsx";
import { Conversation } from "./Conversation.jsx";

export function MainView () {
	return (
		<div className={styles.layout}>
			<div className={styles.grid_input}><Input/></div>
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
		</div>
	);
}
