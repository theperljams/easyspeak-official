import dotenv from 'dotenv';
import { getContextLegacy, getContextCurrent } from './db';
import { ModelFactory, EmbeddingModelType, ChatCompletionModelType, AudioModelType } from './models/modelFactory';

dotenv.config();

// Configure which model types to use
const EMBEDDING_MODEL = EmbeddingModelType.OPENAI;
const CHAT_COMPLETION_MODEL = ChatCompletionModelType.CEREBRAS; // or OPENAI
const AUDIO_MODEL = AudioModelType.OPENAI;

// Create model instances
const embeddingModel = ModelFactory.createEmbeddingModel(EMBEDDING_MODEL);
const chatCompletionModel = ModelFactory.createChatCompletionModel(CHAT_COMPLETION_MODEL);
const audioModel = ModelFactory.createAudioModel(AUDIO_MODEL);

export const getEmbedding = async (content: string) => {
  try {
    return await embeddingModel.getEmbedding(content);
  } catch (error: any) {
    console.error('Error in getEmbedding:', error);
    throw error;
  }
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
  const chatResponse = await chatCompletionModel.getChatCompletion(systemPrompt, query);
  const responseList: string[] = parseNumberedList(chatResponse);
  console.log('Response:', responseList);
  return responseList;
}

export const generateAudio = async (content: string) => {
  try {
    return await audioModel.generateAudio(content);
  } catch (error: any) {
    console.error('Error generating audio:', error);
    throw error;
  }
}
