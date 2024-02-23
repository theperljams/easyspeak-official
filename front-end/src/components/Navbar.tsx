import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from '../Api';
import { NavButton } from './NavButton';

import styles from '../styles/Navbar.module.css';

interface Props {
  setScreen: (x : number) => void
}

export function Navbar({ setScreen } : Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>EasySpeak</div>
      <NavButton label='Dashboard' setScreen={setScreen} screenValue={0}></NavButton>
      <NavButton label='Chat' setScreen={setScreen} screenValue={1}></NavButton>
      <NavButton label='Training' setScreen={setScreen} screenValue={2}></NavButton>
      <Link to={"/"}><button onClick={signOut}>Log Out</button></Link>
    </div>
  );
}