
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
	const [errorMessage, setErrorMessage] = useState('');
	const [messages, setMessage] = useState('');
	
	const login = async () => {
		setErrorMessage('');
	  
		try {
		  const response = await signInWithEmail({ body: { email, password } });
		  
		  if (response.error) {
				setErrorMessage(response.error);
		  } else if (response.data) {
				supabase.auth.getSession().then(({ data: { session: inSession } }) => {
			  setSession(inSession);
				});
		  } else {
				setErrorMessage('An unexpected error occurred. Please try again.');
		  }
		} catch (error) {
		  console.error('Login error:', error);
		  setErrorMessage(error as string);
		}
	  };
	  
	
	const signup = async () => {
		setErrorMessage('');
		setMessage('');
	  
		if (password !== passConfirm) {
		  setErrorMessage('Passwords must match.');
		  return;
		}
	  
		try {
		  const response = await signUpNewUser({ body: { email, password } });
		  
		  if (response.error) {
				setErrorMessage(response.error);
		  } else if (response.data) {
				setMessage('Please check your email for verification.');
				supabase.auth.getSession().then(({ data: { session: inSession } }) => {
			  setSession(inSession);
				});
		  } else {
				setErrorMessage('An unexpected error occurred. Please try again.');
		  }
		} catch (error) {
		  console.error('Signup error:', error);
		  setErrorMessage(error as string);
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
						email={email} error={errorMessage} 
						handleSignIn={login} 
						password={password} 
						setEmail={(e) => setEmail(e)} 
						setError={(e) => setErrorMessage(e)}
						setPassword={(e) => setPassword(e)}/>}/>
					<Route path="/signup" element={<Signup 
						email={email} 
						signupError={errorMessage} 
						handleSignUp={signup} 
						password={password} 
						passConfirm={passConfirm} 
						setEmail={(e) => setEmail(e)} 
						setError={(e) => setErrorMessage(e)}
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
					<Route path="/signup" element={<Home />} />
				</Routes>
			</BrowserRouter>
		);
	}
}
