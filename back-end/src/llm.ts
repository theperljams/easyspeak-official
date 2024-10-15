import dotenv from 'dotenv';
import { fetchRetrievals } from './tests/test_ragie_db';
import OpenAI from 'openai';
import { getContextLong } from './supabase-db';
import { getEmbedding } from './supabase-oai-llm'

dotenv.config();

const ragieApiKey = process.env.RAGIE_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

function extractChunkText(data) {
  return data.scored_chunks.map((chunk) => chunk.text);
}

// Function to generate the system prompt using chunk text
async function generateSystemPrompt(content: string, user_id: string) {

  const currContext = await getContextLong(await getEmbedding(content), "pearl.k.hulbert@gmail.com");

  const infoData = await fetchRetrievals(ragieApiKey, content, user_id, 25, 10, false);
  // console.log("contextInfo:", infoData);
  const contextInfo = extractChunkText(infoData);

  // const styleData = await fetchRetrievals(ragieApiKey, content, user_id, 20, 20, false);
  // console.log("contextStyle:", styleData);
  // const contextStyle = extractChunkText(styleData);
  

  const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
  sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
  based on the context provided. The following context is a sample of ${user_id}'s text conversations. Contine the conversation as if you 
  were responding to another text from ${user_id}'s phone.
  
  Here is the text you are responding to: ${content}

  Here are the samples: ${currContext} ${contextInfo}

  Craft a numbered list of 3 different responses in different contexts. Imitate ${user_id}'s style as shown in their sample texts. Pay attention to details such as common phrases they use,
   anything that looks like it could be an inside joke, or anything else that makes their style distinct.
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
export async function processChatCompletion(query: string, user_id: string) {
  const systemPrompt = await generateSystemPrompt(query, user_id);
  const chatResponse = await getChatCompletion(openAiApiKey, systemPrompt, query);
  const responseList: string[] = parseNumberedList(chatResponse);
  console.log('Response:', responseList);
  return responseList;
}
