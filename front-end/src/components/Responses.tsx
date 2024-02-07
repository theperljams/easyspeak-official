import type { Dispatch, SetStateAction } from 'react';

import styles from './Responses.module.css';

interface Props {
	responses: string[];
	setInputText: Dispatch<SetStateAction<string>>;
}

export function Responses({ responses, setInputText }: Props) {
	return (
		<div className={styles.responses}>
			<div className={styles.titleBar}>
				Responses
			</div>
			
			{responses.length>0 && <div className={styles.responsesList}>
				{responses.map((response, index) => (
					<button
						className={styles.response}
						key={index}
						onClick={() => {
							setInputText(response);
						}}
					>
						{response}
					</button>
				))}
			</div>}
		</div>
	);
}
