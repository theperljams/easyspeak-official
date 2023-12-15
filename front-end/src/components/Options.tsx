import styles from "./Options.module.css";
import VolumeHigh from "../assets/volume-high-solid.svg";
import VolumeMute from "../assets/volume-xmark-solid.svg";

interface Props {
	listen: boolean;
	toggleListen: () => void;
}

export function Options ({ listen, toggleListen }: Props) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "left",
				width: "100%",
				height: "100%",
				gap: "10px",
			}}
		>
			<div
				style={{
					backgroundColor: "#007AFF",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "10px",
					fontSize: ".5em",
				}}
				onClick={toggleListen}
			>
				<span
					style={{
						userSelect: "none",
						minWidth: "250px",
						cursor: "pointer",
					}}
				>
					<img
						style={{
							filter: "color(white)",
						}}
						src={listen ? VolumeHigh : VolumeMute}
						width="30px"
						alt="volume high"
					/>
					&nbsp;
					Listen: {listen ? "On" : "Off"}
				</span>
			</div>

			<div
				className={styles.vertically_centered_children_column}
				style={{
					textAlign: "center",
					width: "100%",
				}}
			>
        Chat
			</div>
		</div>
	);
}
