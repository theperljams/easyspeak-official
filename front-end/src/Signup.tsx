import React, {useState} from 'react';
import {IoEye, IoEyeOutline} from "react-icons/io5";
import {Link} from 'react-router-dom';

import styles from "./styles/Login.module.css";

interface Props {
	email: string
	error: boolean
	password: string
  passConfirm: string
	handleSignUp: () => void
	setEmail: (x : string) => void
	setError: (x : boolean) => void
	setPassword: (x : string) => void
  setPassConfirm: (x : string) => void
}

export function Signup({ email, error, handleSignUp, password, passConfirm, setEmail, setError, setPassword, setPassConfirm } : Props) {
	const [showPassword, setShowPassword] = useState(false);
	
	const swap = () => {
		setEmail('');
		setPassword('');
		setPassConfirm('');
		setShowPassword(false);
		setError(false);
	}
	
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.title}> EasySpeak</div>
				<div className={styles.signup}>
					Already have an account? 
					<Link to={'/'}><button onClick={swap} className={styles.signupbutton}>{'Sign In'}</button></Link>
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
			{ error && <div className={styles.error}>ERROR SIGNING UP</div>}
		</div>
	);
}