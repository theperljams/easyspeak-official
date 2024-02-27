import Icon from '../assets/listen.svg';
import styles from '../styles/Listen.module.css';

interface Props {
	listen: boolean;
	toggleListen: () => void;
}

export function Listen({ listen, toggleListen }: Props) {
	return (
		<div className={styles.container}>
			<div
				className={listen ? styles.listen : styles.nolisten}
				onClick={toggleListen}>
				<img src={Icon} />
			</div>
		</div>
	);
}
