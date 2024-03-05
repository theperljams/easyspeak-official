import React, {useState} from 'react';
import {IoEye, IoEyeOutline} from "react-icons/io5";
import {Link} from 'react-router-dom';

import styles from "./styles/Login.module.css";

interface Props {
	email: string;
	error: string;
	password: string;
	passConfirm: string;
	handleSignUp: () => void;
	setEmail: (x : string) => void;
	setError: (x : string) => void;
	setPassword: (x : string) => void;
	setPassConfirm: (x : string) => void;
}

export function Signup({ email, error, handleSignUp, password, passConfirm, setEmail, setError, setPassword, setPassConfirm } : Props) {
	const [showPassword, setShowPassword] = useState(false);
	const [agreed, setAgreed] = useState(false);
	
	const swap = () => {
		setEmail('');
		setPassword('');
		setPassConfirm('');
		setShowPassword(false);
		setError('');
	};
	
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<Link to={'https://easyspeak.framer.website/'} className={styles.title}>EasySpeak</Link>
				<div className={styles.right}>
					<div className={styles.signup}>
						Already have an account? 
						<Link to={'/'}><button onClick={swap} className={styles.signupbutton}>{'Sign In'}</button></Link>
					</div>
					<div className={styles.signup}>
						By signing up, you agree to acknowledge our
						<Link to={'https://www.privacypolicies.com/live/bc1e56af-76f4-4a30-a06a-9d516ed51c6a'}><button onClick={swap} className={styles.signupbutton}>{'privacy policy.'}</button></Link>
					</div>
				</div>
			</div>
			<div className={styles.subtitle}>
				Sign Up
			</div>
			<div className={styles.message}>
				Welcome!
			</div>
			<div className={styles.form}>
				<input className={styles.input} placeholder='Email' value={email} onChange={(event) => setEmail(event.target.value)}/>
				<input className={styles.input} placeholder='Password' type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)}/>
				<input className={styles.input} placeholder='Confirm Password' type={showPassword ? 'text' : 'password'} value={passConfirm} onChange={(event) => setPassConfirm(event.target.value)}/>
				<button className={styles.showPassword} onClick={() => setShowPassword(!showPassword)}>
					{showPassword ? <IoEye size={35}/> : <IoEyeOutline size={35}/>}
				</button>
			</div>
			<div className={styles.options}>
				<button className={styles.button} onClick={handleSignUp}>Sign Up</button>
			</div>
			{/* <div className={styles.options}>
				<button className={styles.button} onClick={handleSignUp}>Sign Up</button>
			</div> */}
			{ error && <div className={styles.error}>ERROR SIGNING UP</div>}
		</div>
	);
}