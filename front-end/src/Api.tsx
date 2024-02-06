import type { GPTMessage } from "./components/Training";
import { createClient } from '@supabase/supabase-js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const OPENAI_COMPLETE_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;
const supabase = createClient(SUPA_URL, SUPA_API_KEY);
const SUPA_TABLE = 'short';

interface SignUpProps {
  body: {
    email: string
    password: string
  }
}

export const signUpNewUser = async (req:SignUpProps) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'https://example.com/welcome'
    }
  })
}

export const sendQuestionAnswerPairToShort = async (content: string) => {
  const user_id = localStorage.getItem('user_id');
  
  try {
    const response = await fetch(OPENAI_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
        model: 'text-embedding-ada-002'
      })
    });
    
    const json = await response.json()
    const embedding = json.data[0].embedding;
    
    await supabase.from(SUPA_TABLE).insert({
      user_id,
      content, 
      embedding
    });
  } catch (error) {
    console.error('Error making OpenAI embed request:', error);
  }
}

export const generateGPTQuestion = async (messages: GPTMessage[]) => {
  try {
    const response = await fetch(OPENAI_COMPLETE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages
      })
    });
    
    const json = await response.json();
    return json.choices[0].message.content;
    
  } catch (error) {
    console.error('Error making OpenAI complete request:', error);
  }
}

export const generateUserAudio = async (input: string) => {
  try {
    const res = await fetch(`${SERVER_URL}/speak`, {
      method: 'POST',
      body: JSON.stringify({ question: input }),
      headers: {
        'Content-Type': 'application/json',
        'accept': 'audio/wav',
      },
    });

    if (res.ok) {
      const audioData = await res.blob(); // Get audio bytes as a Blob
      console.log('audio data:', audioData);
      return audioData; // Return the audio data directly
    } else {
      console.error('Error fetching audio:', res.statusText);
      return "No audio available";
    }
  } catch (error) {
    console.error('Error generating audio:', error);
    return "No audio available";
  }
}

export const generateUserResponses = async (input: string) => {
  try {
    const res = await fetch(`${SERVER_URL}/generate`, {
      method: 'POST',
      body: JSON.stringify({ content: input }),
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    });
    const data = await res.json() as string[];
    console.log('response: ', data);
    return data;
  } catch (error) {
    console.error('error doing this thing');
    return [];
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
}

// NOTE: you can use the LLM to make a decision based on the info that it gets back
