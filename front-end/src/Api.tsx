import type { GPTMessage } from "./components/Training";

const COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// export const generateGPTEmbeddings = async () => {
//   try {
//     const response = await fetch();
//   }
// }

export const generateGPTQuestion = async (messages: GPTMessage[]) => {
  try {
    const response = await fetch(COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo',
        'messages': messages
      })
    });
    
    if (response.ok) {
      const json = await response.json();
      return json;
    }
    
  } catch (error) {
    console.error('Error making OpenAI request:', error);
  }
}

export const sendQuestionAnswerPair = async () => {
  
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
  const res = await fetch(`${SERVER_URL}/query`, {
    method: 'POST',
    body: JSON.stringify({ question: input }),
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
  });

  const data = await res.json() as string[];
  console.log('response: ', data);
  return data;
}
