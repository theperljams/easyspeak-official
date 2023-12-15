import { useState } from "react";

import VolumeHigh from "../assets/volume-high-solid.svg";
import VolumeMute from "../assets/volume-xmark-solid.svg";
import styles from "./Listen.module.css";

export function Listen () {
	const [listen, setListen] = useState(false);

	function toggleListen () {
		setListen(!listen);
	}

	return (
		<div
			className={styles.listenButton}
			onClick={toggleListen}
		>
			<img className={styles.volumeIcon} src={listen ? VolumeHigh : VolumeMute}/>
			Listen: {listen ? "On" : "Off"}
		</div>
	);
}
