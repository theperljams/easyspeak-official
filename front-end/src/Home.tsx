import {useState} from 'react';
import {Navbar} from './components/Navbar';
import {Chat} from './Chat';

import styles from './styles/Home.module.css';
import {Training} from './Training';
import {Dash} from './Dash';

import {IoIosArrowForward} from "react-icons/io";

export function Home() {
  const [showNav, setShowNav] = useState(true);
  const [screen, setScreen] = useState(0);
  
  return (
    <div className={styles.mainView}>
      { showNav && <Navbar setScreen={setScreen} setShowNav={() => setShowNav(false)}/> } 
      { !showNav && <div className={styles.close} onClick={() => setShowNav(true)}><IoIosArrowForward size={45}/></div>}
      { screen == 0 && <Dash/>}
      { screen == 1 && <Chat/> }
      { screen == 2 && <Training/> }
    </div>
  );
}