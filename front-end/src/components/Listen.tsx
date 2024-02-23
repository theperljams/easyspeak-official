import VolumeHigh from '../assets/volume-high-solid.svg';
import VolumeMute from '../assets/volume-xmark-solid.svg';
import styles from '../styles/Listen.module.css';

interface Props {
	listen: boolean;
	toggleListen: () => void;
}

export function Listen({ listen, toggleListen }: Props) {
	return (
		<div
			className={styles.listenButton}
			onClick={toggleListen}
		>
			<img className={styles.volumeIcon} src={listen ? VolumeHigh : VolumeMute} />
		</div>
	);
}
