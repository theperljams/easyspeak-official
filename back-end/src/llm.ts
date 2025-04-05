import dotenv from 'dotenv';
import OpenAI from 'openai';
import { getContextLegacy, getContextCurrent } from './db';
import axios, { AxiosInstance } from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { put } from '@vercel/blob'; // Add import for put function

dotenv.config();

const openAiApiKey = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_URL: string = 'https://api.openai.com/v1/embeddings';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openAiApiKey,
});

const axiosInstance: AxiosInstance = axios.create({
  headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
  },
});

const googleApiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(googleApiKey!);

export const getEmbedding = async (content: string) => {
  try {
      const response = await axiosInstance.post(OPENAI_EMBEDDING_URL, {
          model: "text-embedding-ada-002",
          input: content,
          encoding_format: "float",
      });
      return response.data.data[0].embedding;
  } catch (error: any) {
      console.error('Error in getEmbedding:', error);
      throw error;
  }
}

function extractChunkText(data) {
  return data.scored_chunks.map((chunk) => chunk.text);
}

// Function to generate the system prompt using chunk text
async function generateSystemPrompt(content: string, user_id: string) {

  const contentEmbedding = await getEmbedding(content);

  const similarContextCurrent = await getContextCurrent(contentEmbedding, user_id, 5, 0.7);
  const similarContextLegacy = await getContextLegacy(contentEmbedding, user_id, 5, 0.0);

  const styleContextCurrent = await getContextCurrent(contentEmbedding, user_id, 20, 0.3);
  const styleContextLegacy = await getContextLegacy(contentEmbedding, user_id, 20, 0.0);


  const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
  sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
  based on the context provided. You are given two samples of ${user_id}'s text conversations. The first one contains previous conversations that are the most similar to 
  the current conversation. Use these for information to make an educated guess about how ${user_id} would respond. The second one is various sample texts showing how ${user_id} texts in general and will likely contain some similar 
  conversations ${user_id} has had in the past (they will not necessarily though). Use the first sample primarily for information and the second mostly for style. 
  Contine the conversation as if you 
  were responding to another text from ${user_id}'s phone.
  
  Here is the text you are responding to: ${content}

  Here are the samples: 
  Current conversation: ${similarContextCurrent} 
  ${similarContextLegacy}
  
  Past conversations: ${styleContextCurrent}
  ${styleContextLegacy}

  Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. From these samples: infer ${user_id}'s 
  tone, style, values and beliefs, background and experience, personal preferences, writing habits, and emotional underpinning. Assume the audience is a good friend and 
  the purpose is just casual conversation. If one or both of the first two samples are left blank, do your best by relying on previous similar conversations from the second sample.
 DO NOT share any information not contained in the samples. If there is a text you don't know how to 
  respond to based on the samples, give 3 different "I don't know" responses that sound like something ${user_id} would say. You should ONLY rely on information that you know ${user_id} knows.`;


  console.log(prompt);

  return prompt; 
}

// Function to call Gemini API with generated prompt and user query
async function getChatCompletion(googleApiKey: string, systemPrompt: string, query: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-lite",
    systemInstruction: systemPrompt
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: query }] }],
    generationConfig: {
      temperature: 0.7,
    }
  });

  return result.response.text();
}

const hasNumericalCharacter = (inputString: string) => {
  return /\d/.test(inputString);
}

const parseNumberedList = (inputString: string) => {
  if (!hasNumericalCharacter(inputString)) {
      return [inputString];
  }

  const lines: string[] = inputString.trim().split('\n');
  const items: string[] = [];

  for (const line of lines) {
      const parts: string[] = line.split('. ', 2);
      if (parts.length === 2 && !isNaN(parseInt(parts[0], 10))) {
          const itemContent: string = parts[1].trim();
          items.push(itemContent);
      }
  }

  return items;
}


export async function processChatCompletion(query: string, user_id: string) {
  const systemPrompt = await generateSystemPrompt(query, user_id);
  const chatResponse = await getChatCompletion(googleApiKey, systemPrompt, query);
  const responseList: string[] = parseNumberedList(chatResponse);
  console.log('Response:', responseList);
  return responseList;
}

export const generateAudio = async (content: string) => {
    try {
        const audioFile = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: content,
        });

        const buffer: Buffer = Buffer.from(await audioFile.arrayBuffer());

        const { url } = await put('speech.wav', buffer, { access: 'public' });
        const speechUrl: string = url;
        console.log("speechUrl:", speechUrl);

        return speechUrl;
    } catch (error: any) {
        console.error('Error generating audio:', error);
        throw error;
    }
}
