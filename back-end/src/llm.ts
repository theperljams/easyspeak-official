import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Assuming these functions exist in './db'
import { getContextLong, getContextShort } from './db';

const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
const OPENAI_EMBEDDING_URL: string = 'https://api.openai.com/v1/embeddings';
const OPENAI_CHAT_COMPLETION_URL: string = 'https://api.openai.com/v1/chat/completions';

const USER_NAME: string = 'Pearl';

const axiosInstance: AxiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

const openai: OpenAI = new OpenAI();

export async function getEmbedding(content: string): Promise<number[]> {
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

export async function generateResponses(content: string): Promise<string[]> {
    let contextShort: string[] = (await getContextShort(await getEmbedding(content)));
    let contextLong: string[] = (await getContextLong(await getEmbedding(content)));
    
    console.log("SHORT: ", contextShort);
    console.log("LONG: ", contextLong);

    const prompt: string = `You are an assistant drafting texts for ${USER_NAME}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

    Step 1: Look at the context below to learn how ${USER_NAME} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given contextShort below to answer questions. Answer the question as if you were sending a text from ${USER_NAME}'s phone. 
    This dataset mainly contains basic information. The assistant speaks as ${USER_NAME}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${USER_NAME} say they are studying?" 

    contextShort: ${contextShort}

    content: ${content}
    user: ${USER_NAME}
    
    Step 2: Now, look at this context to learn ${USER_NAME}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic ${USER_NAME}. 
    This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${USER_NAME}.

    contextLong: ${contextLong}
    
    Remember: If the answer is not contained in any either contextShort or contextLong or if for any reason the assistant cannot provide a response to the given content, 
    give an 'I don't know' response that ${USER_NAME} might say if given a question they didn't know the answer to.

    Other: ${content}
    ${USER_NAME}:
    
    Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this.`

    const response: string = await getChatCompletions(prompt);
    return parseNumberedList(response);
}

export async function generateQuestion(content: string): Promise<string> {
    const prompt: string = `You are asking questions to get to know the user as a friend
    and also as if you were trying to write a book about them. 
    Ask one question at a time. Keep asking questions.
    Do not say anything about yourself. If the assistant has asked a question, 
    do not ask it again. What follows is the conversation so far: ${content}`;

    try {
        const response: string = await getChatCompletions(prompt);
        return response;
    } catch (error: any) {
        console.error('Error in generateQuestion:', error);
        throw error;
    }
}

async function getChatCompletions(prompt: string): Promise<string> {
    try {
        const response = await axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4-0125-preview",
            messages: [{ "role": "user", "content": prompt }],
        });
        
        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error('Error in getChatCompletions:', error);
        throw error;
    }
}

export async function generateAudio(content: string): Promise<string> {
    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: content,
        });

        const buffer: Buffer = Buffer.from(await mp3.arrayBuffer());
        const speechFile: string = path.resolve(`./${Date.now()}_speech.mp3`);
        await fs.promises.writeFile(speechFile, buffer);

        console.log('Audio file created:', speechFile);
        return speechFile;
    } catch (error: any) {
        console.error('Error generating audio:', error);
        throw error;
    }
}

function parseNumberedList(inputString: string): string[] {
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

function hasNumericalCharacter(inputString: string): boolean {
    return /\d/.test(inputString);
}
