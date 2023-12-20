import { useState, useEffect } from "react";

import styles from "./Responses.module.css";

interface Props {
	// generate: (value: string, index: number) => Promise<void>;
	responses: string[];
	setInputText: React.Dispatch<React.SetStateAction<string>>;
}


export function Responses ({ responses , setInputText}: Props) {
	

	// // Run this effect only once on mount
	// useEffect(() => {
	// 	const textboxes = document.querySelectorAll(`.${styles.styledBox}`);

	// 	textboxes.forEach((textbox, index) => {
	// 		textbox.addEventListener("input", (event) => {
	// 			const { value } = event.target as HTMLInputElement;
	// 			void generate(value, index);
	// 		});
	// 	});
	// }, []);

	return (
		<div className={styles.responses}>
			<div className={styles.titleBar}>
				Responses
			</div>
			<div className={styles.responsesList}>
				{responses.map((response, index) => (
					<button
						className={styles.response}
						key={index}
						onClick={() => setInputText(response)}
					>
						{response}
					</button>
				))}
			</div>
		</div>
	);
}
