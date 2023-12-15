import styles from "./InputBar.module.css";

interface Props {
    icon: string;
    clicked?: () => void;
}

export function InputButton ({ icon, clicked }: Props) {
	return (
		<div className={styles.button} onClick={clicked}>
			<img src={icon} alt="icon" className={styles.buttonIcon} />
		</div>
	);
}
