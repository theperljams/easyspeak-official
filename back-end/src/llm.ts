import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Assuming these functions exist in './db'
import { getContextLong, getContextShort } from './db';

const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
const OPENAI_EMBEDDING_URL: string = 'https://api.openai.com/v1/embeddings';
const OPENAI_CHAT_COMPLETION_URL: string = 'https://api.openai.com/v1/chat/completions';

const axiosInstance: AxiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

const openai: OpenAI = new OpenAI();

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

export const generateResponses = async (content: string, messages: string[], user_id: string) => {
    let contextShort: string[] = (await getContextShort(await getEmbedding(content), user_id));
    let contextLong: string[] = (await getContextLong(await getEmbedding(content), user_id));

    const prompt: string = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

    Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given contextShort below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
    This dataset mainly contains basic information. You speak as ${user_id}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" 

    contextShort: ${contextShort}

    content: ${content}
    user: ${user_id}
    
    Step 2: Now, look at this context to learn ${user_id}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic ${user_id}. 
    This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${user_id}.

    contextLong: ${contextLong}
    
    Remember: If the answer is not contained in any either contextShort or contextLong or if for any reason you cannot provide a response to the given content, 
    give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to.

    Other: ${content}
    ${user_id}:
    
    ALWAYS DO THIS STEP:
    
    Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this.`

    const response: string = await getChatCompletions(prompt, messages);
    return parseNumberedList(response);
}

export const generateQuestion = async (messages: string[]) => {
    const prompt: string = `You are asking questions to get to know the user as a friend
    and also as if you were trying to write a book about them. 
    Ask one question at a time. Keep asking questions.
    Do not say anything about yourself. If the assistant has asked a question, 
    do not ask it again. What follows is the conversation so far: ${messages}`;

    try {
        const response: string = await getChatCompletions(prompt, messages);
        return response;
    } catch (error: any) {
        console.error('Error in generateQuestion:', error);
        throw error;
    }
}

export const generateAudio = async (content: string) => {
    try {
        const audioFile = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: content,
        });

        const buffer: Buffer = Buffer.from(await audioFile.arrayBuffer());
        const fileName: string = `${Date.now()}_speech.wav`;
        const speechFile: string = path.resolve(`./public/${fileName}`);
        await fs.promises.writeFile(speechFile, buffer);

        console.log('Audio file created:', speechFile);
        const speechUrl: string = `http://localhost:3000/${fileName}`;
        console.log("speechUrl:", speechUrl);

        setTimeout(() => {
            fs.unlink(speechFile, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted:', speechFile);
                }
            });
        }, 7000); 

        return speechUrl;
    } catch (error: any) {
        console.error('Error generating audio:', error);
        throw error;
    }
}

const getChatCompletions = async (prompt: string, messages: string[]) => {
    try {
        const response = await axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4-0125-preview",
            messages: [{ "role": "system", "content": prompt }, ...messages],
        });
        
        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error('Error in getChatCompletions:', error);
        throw error;
    }
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

const hasNumericalCharacter = (inputString: string) => {
    return /\d/.test(inputString);
}
