import { useState, useEffect } from "react";

import styles from "./Responses.module.css";

const SERVER_URL = "http://0.0.0.0:8000";

export function Responses () {
	const [responses, setResponses] = useState(["", "", "", ""]);

	async function generate (voiceInput: string, index: number): Promise<void> {
		try {
			const res = await fetch(`${SERVER_URL}/query`, {
				method: "POST",
				body: JSON.stringify({ question: voiceInput }),
				headers: {
					"Content-Type": "application/json",
					accept: "application/json",
				},
			});

			const data = await res.text();
			console.log(res);

			if (res.status === 200) {
				setResponses((prevResponses) => {
					const newResponses = [...prevResponses];
					newResponses[index] = data;
					return newResponses;
				});
			}
			else {
				setResponses((prevResponses) => {
					const newResponses = [...prevResponses];
					newResponses[index] = "I don't know";
					return newResponses;
				});
			}
		}
		catch (error) {
			console.error("Error fetching response:", error);
		}
	}

	// Run this effect only once on mount
	useEffect(() => {
		const textboxes = document.querySelectorAll(`.${styles.styledBox}`);

		textboxes.forEach((textbox, index) => {
			textbox.addEventListener("input", (event) => {
				const { value } = event.target as HTMLInputElement;
				void generate(value, index);
			});
		});
	}, []);

	return (
		<div className={styles.boxContainer}>
			{responses.map((response, index) => (
				<input
					key={index}
					type="text"
					className={styles.styledBox}
					placeholder={`Textbox ${index + 1}`}
					value={response}
					readOnly
				/>
			))}
		</div>
	);
}
