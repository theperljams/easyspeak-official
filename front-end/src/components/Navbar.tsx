import React from 'react';
import {signOut} from '../Api';
import {NavButton} from './NavButton';
import {IoIosArrowBack} from "react-icons/io";

import styles from '../styles/Navbar.module.css';

interface Props {
	setScreen: (x : number) => void;
	setShowNav: () => void;
}

export function Navbar({ setScreen, setShowNav } : Props) {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.title}>EasySpeak</div>
				<div onClick={setShowNav}> 
					<IoIosArrowBack size={45}/>
				</div>
			</div>
			<NavButton label='Test' setShowNav={setShowNav} setScreen={setScreen} screenValue={0}></NavButton>
			<NavButton label='Chat' setShowNav={setShowNav} setScreen={setScreen} screenValue={1}></NavButton>
			<NavButton label='Training' setShowNav={setShowNav} setScreen={setScreen} screenValue={2}></NavButton>
			<div className={styles.navButton} onClick={signOut}><div className={styles.link}>Log out</div></div>
		</div>
	);
}