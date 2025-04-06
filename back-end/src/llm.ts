import dotenv from 'dotenv';
import { getContextLegacy, getContextCurrent } from './db';
import { ModelFactory, EmbeddingModelType, ChatCompletionModelType, AudioModelType } from './models/modelFactory';
import { prompts } from './prompts/textGeneration';

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

  const prompt = prompts.default.generate(
    content,
    user_id,
    similarContextCurrent,
    similarContextLegacy,
    styleContextCurrent,
    styleContextLegacy
  );

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
