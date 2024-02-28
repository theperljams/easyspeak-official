import React from 'react';

import styles from '../styles/Navbar.module.css';

interface Props {
	label: string;
	setScreen: (x: number) => void;
	setShowNav: () => void;
	screenValue: number;
}

export function NavButton({ label, setScreen, setShowNav, screenValue } : Props) {
	return (
		<div className={styles.navButton} onClick={() => {setScreen(screenValue); setShowNav();}}>
			<div className={styles.link}>
				{label}
			</div>
		</div>
	);
}