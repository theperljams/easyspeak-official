import type {Dispatch, SetStateAction} from 'react';

import styles from '../styles/Responses.module.css';

interface Props {
	responses: string[];
	setInputText: (x : string) => void;
}

export function Responses({ responses, setInputText }: Props) {
	return (
		<div className={styles.responses}>
			{responses.length > 0 && (
				<div className={styles.responsesList}>
					{responses.map((response, index) => (
						// <div className="buttons-wrapper">
						// </div>

							<button
								className={styles.response}
								key={index}
								onClick={() => {
									setInputText(response);
								}}
								style={{
									visibility: response == ' ' ? 'hidden' : 'visible',
									pointerEvents: response == ' ' ? 'none' : 'auto',
									width: response == 'Reselect training mode' ? '1000px' : '100%',
									height: response == 'Reselect training mode' ? '45%' : '100%'
									// position: response == 'Reselect training mode' ? 'relative' : 'absolute'// visibility:
								}}>
								{response}
							</button>
					))}
				</div>
			)}
		</div>
	);
}
