import type { Dispatch, SetStateAction } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

import styles from '../styles/Responses.module.css';

interface Props {
	responses: string[];
	setInputText: (x: string) => void;
	isGenerating: boolean;
	currentPage: number;
	totalPages: number;
	onNextPage: () => void;
	onPrevPage: () => void;
}

export function Responses({ responses, setInputText, isGenerating, currentPage, totalPages, onNextPage, onPrevPage }: Props) {
	const showArrows = totalPages > 1;

	return (
		<div className={styles.responses}>
			{showArrows && (
				<button 
					className={styles.arrowButton}
					onClick={onPrevPage}
					disabled={currentPage === 0}
					style={{ opacity: currentPage === 0 ? 0.3 : 1 }}
				>
					<IoChevronBack size={40} />
				</button>
			)}
            
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

			{showArrows && (
				<button 
					className={styles.arrowButton}
					onClick={onNextPage}
					disabled={currentPage === totalPages - 1}
					style={{ opacity: currentPage === totalPages - 1 ? 0.3 : 1 }}
				>
					<IoChevronForward size={40} />
				</button>
			)}
		</div>
	);
}
