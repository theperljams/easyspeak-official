import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Chat } from './Chat';

import styles from './styles/Home.module.css';
import { Training } from './Training';
import { Dash } from './Dash';

export function Home() {
  const [showNav, setShowNav] = useState(true);
  const [screen, setScreen] = useState(0);
  
  return (
    <div className={styles.mainView}>
      { showNav && <Navbar setScreen={setScreen}/> } 
      <button className={showNav ? styles.open : styles.close} onClick={() => setShowNav(!showNav)}>setShowNav</button>
      { screen == 0 && <Dash/>}
      { screen == 1 && <Chat/> }
      { screen == 2 && <Training/> }
    </div>
  );
}