import dotenv from 'dotenv';
import { fetchRetrievals } from './test_ragie_db';
import OpenAI from 'openai';

dotenv.config();

const ragieApiKey = process.env.RAGIE_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

function extractChunkText(data) {
  return data.scored_chunks.map((chunk) => chunk.text);
}

// Function to generate the system prompt using chunk text
async function generateSystemPrompt(content: string, user_id: string) {

  const infoData = await fetchRetrievals(ragieApiKey, content, user_id, 5, 4);

  const contextInfo = extractChunkText(infoData);
  console.log(contextInfo);

  const styleData = await fetchRetrievals(ragieApiKey, content, user_id, 10, 5);

  const contextStyle = extractChunkText(styleData);
  console.log(contextStyle);

  const prompt  = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
  sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
  based on the context provided. The following contextInfo and contextStyle are sample texts ${user_id} has written. Contine the conversation as if you 
  were responding to another text from ${user_id}'s phone.
  Follow these steps to learn how to do this.
 
 Step 1: The content is text you are responding to. contextInfo contains the most relevant texts to the content. Use these for information to respond.
 
 contextInfo: ${contextInfo}
 
 content: ${content}
 
 Step 2: contextStyle contains the rest of the message history. Look at these to get a sense of ${user_id}'s writing style and personality. 
 Use this to help you mimic ${user_id}'s voice. Edit your previous response to sound more like ${user_id} based on the two contexts. This step is very important. 
 
 contextStyle: ${contextStyle}
 
 Remember: If the answer is not contained in any either contextInfo or contextStyle or if for any reason you cannot provide a response to the given content, 
 give an 'I don't know' response in ${user_id}'s style.
 
 Other: ${content}
 ${user_id}:
 
 ALWAYS DO THIS STEP:
 
 Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
 Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`

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

// Main function to handle the workflow
export async function processChatCompletion(query: string, user_id: string) {
  const systemPrompt = await generateSystemPrompt(query, user_id);
  console.log(systemPrompt);
  const chatResponse = await getChatCompletion(openAiApiKey, systemPrompt, query);
  console.log(chatResponse);
}
