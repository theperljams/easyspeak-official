import {useEffect, useState} from 'react';
import {Navbar} from './components/Navbar';
import {Chat} from './Chat';
import {Test} from './Test';

import styles from './styles/Home.module.css';
// import {Training} from './Training';
import {Dash} from './Dash';

import { IoIosArrowForward } from "react-icons/io";
import type { Message } from './components/Interfaces';

export function Home() {

	const [showNav, setShowNav] = useState(false);
	const [screen, setScreen] = useState(1);
	const [messages, setMesssages] = useState<Message[]>([]);

	useEffect(() => {
		const storedScreen = localStorage.getItem('screen');
		if (storedScreen != null)
		{
			setScreen(parseInt(storedScreen));
			setShowNav(false);
		}
	}, []);

	
  
	return (
		<div className={styles.mainView}>
			{ showNav && <Navbar setScreen={setScreen} setShowNav={() => setShowNav(false)}/> } 
			{ !showNav && <div className={styles.close} onClick={() => setShowNav(true)}><IoIosArrowForward size={45}/></div>}
			{/* { screen == 0 && <Test messageHistory={messages ? messages : []} setMessageHistory={setMesssages}/>} */}
			{ screen == 1 && <Chat messageHistory={messages ? messages : []} setMessageHistory={setMesssages}/> }
			{/* { screen == 2 && <Training/> } */}
		</div>
	);
}
