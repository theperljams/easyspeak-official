import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'regenerator-runtime/runtime'

import './index.css';
import { createClient, type Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import {
  // Import predefined theme
  ThemeSupa,
} from '@supabase/auth-ui-shared'

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