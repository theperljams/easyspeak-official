import Icon from '../assets/listen.svg';
import { SlRefresh } from "react-icons/sl";
import styles from "../styles/RefreshButton.module.css";

interface Props {
	handleRefresh: () => void;
}

export function RefreshButton({ handleRefresh }: Props) {
	return (
		<div className={styles.container}>
			<div
				onClick={handleRefresh}>
				<SlRefresh size={40} color={'grey'}/>
			</div>
		</div>
	);
}


