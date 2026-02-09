import {createClient} from '@supabase/supabase-js';
import type {Message} from './components/Interfaces';
import { IoTabletLandscape } from 'react-icons/io5';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(SUPA_URL, SUPA_API_KEY);

interface SignUpProps {
	body: {
		email: string;
		password: string;
	};
}

interface SignInProps {
	body: {
		email: string;
		password: string;
	};
}

export const signUpNewUser = async (req: SignUpProps): Promise<{ data?: any; error?: string }> => {
	const { email, password } = req.body;
  
	if (!email || !password) {
	  return { error: 'Email and password are required.' };
	}
  
	if (password.length < 8) {
	  return { error: 'Password should be at least 8 characters long.' };
	}
  
	try {
	  const { data, error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
		  emailRedirectTo: 'https://easyspeak-aac.com/',
			},
	  });
  
	  if (error) {
			console.error('Supabase sign-up error:', error.message);
  
			return {error: error.message};
	  }
  
	  return { data };
	} catch (error) {
	  console.error('Unexpected error during sign up:', error);
	  return { error: 'An unexpected error occurred. Please try again later.' };
	}
};
  

export const signInWithEmail = async (req: SignInProps): Promise<{ data?: any; error?: string }> => {
	const { email, password } = req.body;
  
	if (!email || !password) {
	  return { error: 'Email and password are required.' };
	}
  
	try {
	  const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
	  });
  
	  if (error) {
			console.error('Supabase sign-in error:', error.message);
  
			return {error: error.message};
	  }
  
	  return { data };
	} catch (error) {
	  console.error('Unexpected error during sign in:', error);
	  return { error: 'An unexpected error occurred. Please try again later.' };
	}
};
  


export const sendQuestionAnswerPair = async (content: string, table: string) => {
	const user_id = localStorage.getItem('user_id');
	const request = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			content: content,
			table_name: table,
			user_id: user_id,
		})
	};
	
	console.log('Making request with:', request);
	
	try {
		await fetch(`${SERVER_URL}/insert`, request);
	} 
	catch (error) {
		console.error('Error inserting into db:', error);
	}
};

export const generateGPTQuestion = async (messages: Message[], chat: string) => {
	const user_id = localStorage.getItem('user_id');
	
	try {
		const response = await fetch(`${SERVER_URL}/training`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: user_id,
				messages: messages,
				chat: chat
			})
		});
    
		const json = await response.json();
		return json;
    
	} catch (error) {
		console.error('Error making OpenAI complete request:', error);
	}
};

export const generateUserAudio = async (input: string) => {
	console.log('input: ', input);
	try {
		const response = await fetch(`${SERVER_URL}/tts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'accept': 'audio/wav',
			},
			body: JSON.stringify({
				text: input,
			}),
		});
		const audioData = await response.json();
		console.log('audioData: ', audioData);
		return audioData;
	}
	catch (error) {
		console.error('Error generating audio:', error);
		return 'No audio available';
	}
};

export const generateUserResponses = async (question: string, messages: Message[]) => {
	try {
		// Get the current session from Supabase
		const { data: { session } } = await supabase.auth.getSession();
		
		if (!session) {
			console.error('Not authenticated. Please log in.');
			// Redirect to login if not authenticated
			if (window.location.pathname !== '/' && window.location.pathname !== '/signup') {
				window.location.href = '/';
			}
			return [];
		}

		// Get the access token from the session
		const authToken = JSON.stringify({ access_token: session.access_token });

		console.log(JSON.stringify({ content: question }));
		const res = await fetch(`${SERVER_URL}/generate`, {
			method: 'POST',
			body: JSON.stringify({ 
				content: question, 
				messages: messages, 
				user_id: session.user.email, 
				jwt: authToken 
			}),
			headers: {
				'Content-Type': 'application/json',
				'accept': 'application/json',
			},
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error(`Server error: ${res.status} - ${errorText}`);
			if (res.status === 401) {
				// Token is invalid, redirect to login
				window.location.href = '/';
			}
			return [];
		}

		const data = await res.json() as string[];
		console.log(data);
		return data;
	}
	catch (error) {
		console.error('error generating responses:', error);
		return [];
	}
};

export const signOut = async () => {
	const { error } = await supabase.auth.signOut();
};

