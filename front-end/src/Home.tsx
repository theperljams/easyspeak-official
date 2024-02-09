import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.mainView}>
      <div className={styles.navBar}>
        <Link to="/chat">Chat</Link>
        <Link to="/training">Training</Link>
      </div>
    </div>
  );
}