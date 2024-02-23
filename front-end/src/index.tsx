import { createRoot } from 'react-dom/client';
import 'regenerator-runtime/runtime'

import './styles/index.css';
import { createClient, type Session } from '@supabase/supabase-js'
import { App } from './App';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(SUPA_URL, SUPA_API_KEY);

document.body.style.overflow = "hidden"

const root = createRoot(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	document.getElementById('root')!,
);

root.render(<App/>);