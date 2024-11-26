import dotenv from 'dotenv';
import { fetchRetrievals } from './tests/test_ragie_db';
import OpenAI from 'openai';
import { getContextConversation, getCurrentConversationMessages, getCurrentConversationMessagesBySender, getMessagesByHashedSenderName, getMessagesUpToTimestamp } from './supabase-db';
import axios, { AxiosInstance } from 'axios';

dotenv.config();

const ragieApiKey = process.env.RAGIE_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_URL: string = 'https://api.openai.com/v1/embeddings';

const axiosInstance: AxiosInstance = axios.create({
  headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
  },
});


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
async function generateSystemPrompt(content: string, user_id: string, name: string, timestamp: number) {

  const convoContext = await getCurrentConversationMessagesBySender(name);

  const personContext = await getMessagesByHashedSenderName(name, 10);
  // console.log("currContext:", currContext);


  const infoData = await fetchRetrievals(ragieApiKey, content, "pearl@easyspeak-aac.com", 25, 10, false);
  // console.log("contextInfo:", infoData);
  const contextInfo = extractChunkText(infoData);

  // const styleData = await fetchRetrievals(ragieApiKey, content, user_id, 20, 20, false);
  // console.log("contextStyle:", styleData);
  // const contextStyle = extractChunkText(styleData);
  

//   const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
//   sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
//   based on the context provided. The following context is a sample of ${user_id}'s text conversations. Contine the conversation as if you 
//   were responding to another text from ${user_id}'s phone.
  
//   Here is the text you are responding to: ${content}

//   Here are the samples: ${currContext} ${contextInfo}

//   Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. Pay attention to details such as common phrases they use,
//    anything that looks like it could be an inside joke, or anything else that makes their style distinct.
//  DO NOT share any information not contained in the samples. If there is a text you don't know how to 
//   respond to based on the samples, give 3 different "I don't know" responses that sound like something ${user_id} would say. You should ONLY rely on information that you know ${user_id} knows.`;

// const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
//   sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
//   based on the context provided. You are given two samples of ${user_id}'s text conversations. The first one contains conversations with the person 
//   ${user_id} is currently texting. The second one is various sample texts showing how ${user_id} texts in general and will likely contain some similar 
//   conversations ${user_id} has had in the past. Contine the conversation as if you 
//   were responding to another text from ${user_id}'s phone.
  
//   Here is the text you are responding to: ${content}

//   Here are the samples: 

//   Past conversations with current person: ${currContext} 
  
//   Other past conversations: ${contextInfo}

//   Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. From these samples: infer ${user_id}'s 
//   tone, style, values and beliefs, background and experience, personal preferences, writing habits, and emotional underpinning. Assume the audience is a good friend and 
//   the purpose is just casual conversation. If the first sample is left blank, do your best by relying on previous similar conversations from the second sample.
//  DO NOT share any information not contained in the samples. If there is a text you don't know how to 
//   respond to based on the samples, give 3 different "I don't know" responses that sound like something ${user_id} would say. You should ONLY rely on information that you know ${user_id} knows.`;

  // console.log(prompt);


  const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
  sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
  based on the context provided. You are given three samples of ${user_id}'s text conversations. The first one contains texts from the current conversation the user is having. 
  The second contains previous conversations with the person 
  ${user_id} is currently texting. The third one is various sample texts showing how ${user_id} texts in general and will likely contain some similar 
  conversations ${user_id} has had in the past. Contine the conversation as if you 
  were responding to another text from ${user_id}'s phone.
  
  Here is the text you are responding to: ${content}

  Here are the samples: 
  Current conversation: ${convoContext}

  Past conversations with current person: ${personContext} 
  
  Other past conversations: ${contextInfo}

  Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. From these samples: infer ${user_id}'s 
  tone, style, values and beliefs, background and experience, personal preferences, writing habits, and emotional underpinning. Assume the audience is a good friend and 
  the purpose is just casual conversation. If one or both of the first two samples are left blank, do your best by relying on previous similar conversations from the third sample.
 DO NOT share any information not contained in the samples. If there is a text you don't know how to 
  respond to based on the samples, give 3 different "I don't know" responses that sound like something ${user_id} would say. You should ONLY rely on information that you know ${user_id} knows.`;


  console.log(prompt);

  return prompt; 
}

// Function to call OpenAI API with generated prompt and user query
async function getChatCompletion(openAiApiKey, systemPrompt, query) {
  const openai = new OpenAI({ apiKey: openAiApiKey });
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
    model: "gpt-4o-mini",
  });

  return chatCompletion.choices[0].message.content;
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

// Main function to handle the workflow
export async function processChatCompletion(query: string, user_id: string, name: string, timestamp: number) {
  const systemPrompt = await generateSystemPrompt(query, user_id, name, timestamp);
  const chatResponse = await getChatCompletion(openAiApiKey, systemPrompt, query);
  const responseList: string[] = parseNumberedList(chatResponse);
  console.log('Response:', responseList);
  return responseList;
}
