import type { Dispatch, SetStateAction } from 'react';

import styles from '../styles/Responses.module.css';

interface Props {
	responses: string[];
	setInputText: (x: string) => void;
	isGenerating: boolean;
}

export function Responses({ responses, setInputText, isGenerating }: Props) {
	return (
		<div className={styles.responses}>
			<div className={styles.responsesList}>
				{responses.map((response, index) => (
					<button
						className={styles.response}
						key={index}
						onClick={() => setInputText(response)}
						style={{
							visibility: response === ' ' ? 'hidden' : 'visible',
							pointerEvents: response === ' ' ? 'none' : 'auto',
							width: response === 'Select mode' ? '45%' : '100%',
							height: response === 'Select mode' ? '45%' : '100%'
						}}>
						{response}
					</button>
				))}
			</div>
		</div>
	);
}
