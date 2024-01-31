import { createClient, type Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import {
  // Import predefined theme
  ThemeSupa,
} from '@supabase/auth-ui-shared'
import { useEffect, useState } from "react";
import { Home } from './Home';
import { signOut } from './Api';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(SUPA_URL, SUPA_API_KEY);

export function App() {
	const [session, setSession] = useState<Session|null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
		
		return () => subscription.unsubscribe()
	}, []);
	
	useEffect(() => {
		const user = session?.user.email;
		
		if (user) {
			localStorage.setItem('user_id', user);
		}
	}, [session]);

	if (session === null) {
		return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
	}
	else {
		return (<Home/>)
	}
}