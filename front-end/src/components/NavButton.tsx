import React from 'react';

import styles from '../styles/Navbar.module.css';
import { Link } from 'react-router-dom';

interface Props {
  label: string
  setScreen: (x: number) => void
  screenValue: number
}

export function NavButton({ label, setScreen, screenValue } : Props) {
  return (
    <div className={styles.navButton}>
      <button className={styles.link} onClick={() => setScreen(screenValue)}>
        {label}
      </button>
    </div>
  );
}