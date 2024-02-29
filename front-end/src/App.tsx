
import {createClient, type Session} from '@supabase/supabase-js';
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Home} from './Home';
import {Login} from './Login';
import {signInWithEmail, signUpNewUser} from './Api';
import {Signup} from './Signup';


const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(SUPA_URL, SUPA_API_KEY);

export function App() {

	const [session, setSession] = useState<Session|null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passConfirm, setPassConfirm] = useState('');
	const [error, setError] = useState('');
	const [messages, setMessage] = useState('');
	
	const login = async () => {
		const response = await signInWithEmail({ body: { email: email, password: password }});
		
		if  (response != null) {
			supabase.auth.getSession().then(({ data: { session: inSession } }) => {
				setSession(inSession);
			});
		} else {
			setError('Error Loggin in');
		}
	};
	
	const signup = async () => {
		if (password != passConfirm) {
			setError('Passwords must match');
			return;
		} else {
			setMessage('Please check your email for verification');
		}
		
		const response = await signUpNewUser({ body: { email: email, password: password }});
		
		console.log(response);
		
		if (response != null) {
			supabase.auth.getSession().then(({ data: { session: inSession } }) => {
				setSession(inSession);
			});
		} else {
			setError('Error Signing Up');
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session: tempSession } }) => {
			setSession(tempSession);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, tempSession) => {
			setSession(tempSession);
		});

		return () => { subscription.unsubscribe(); };
	}, []);

	useEffect(() => {
		const user = session?.user.email;

		if (user) {
			localStorage.setItem('user_id', user);
		}
	}, [session]);

	if (session === null) {
		return (
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Login 
						email={email} error={error} 
						handleSignIn={login} 
						password={password} 
						setEmail={(e) => setEmail(e)} 
						setError={(e) => setError(e)}
						setPassword={(e) => setPassword(e)}/>}/>
					<Route path="/signup" element={<Signup 
						email={email} 
						error={error} 
						handleSignUp={signup} 
						password={password} 
						passConfirm={passConfirm} 
						setEmail={(e) => setEmail(e)} 
						setError={(e) => setError(e)}
						setPassword={(e) => setPassword(e)} 
						setPassConfirm={(e) => setPassConfirm(e)}/>}/>
				</Routes>
			</BrowserRouter>
		);

	}
	else {
		return (
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		);
	}
}
