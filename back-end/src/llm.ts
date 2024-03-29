import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

import { put } from "@vercel/blob";

import { getContextAll, getContextLong, getContextShort, getSethContext} from './db';
import { get } from 'http';

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

    let contextShort : string[] = [];
    let contextLong : string[] = [];
    let contextInfo: string[] = [];
    let contextStyle: string[] = [];

    let promptType: string = "";

    if (user_id === "seth@alscrowd.org") {
        contextInfo = (await getSethContext(await getEmbedding(content), 10, 0.6));
        contextStyle = (await getSethContext(await getEmbedding(content), 90, 0.0));
    }
    else {
        contextShort = (await getContextShort(await getEmbedding(content), user_id));
        contextLong = (await getContextLong(await getEmbedding(content), user_id));
    }
    
    const prompt1: string = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
         sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
         based on the context provided.
         You speak as ${user_id}. For example, if the content contains: 
         "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" Stay true to what is found in the context. If you see a similar question, and answer exchange, 
         use that as a guide.
         Follow these steps to learn how to do this.

 Step 1: Search the given contextShort below to learn basic information about the user and how they respond to casual questions.
 Lean more into the style shown in this database for casual conversations with relatively simple responses.

 contextShort: ${contextShort}

 content: ${content}
 user: ${user_id}

 Step 2: Now, look at contextLong to learn ${user_id}'s writing style. This dataset contains answers that are more like journal entries. 
 Lean more into this style when doing thing like telling stories, expressing emotion, or having deeper conversations.
 If there is information relevant to responding to the content, use it in your response.
 If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${user_id}. 
 This step is very important. These texts need to sound as much like ${user_id} as possible. Err on being more concise and casual.

 contextLong: ${contextLong}

 Remember: If the answer is not contained in any either contextShort or contextLong or if for any reason you cannot provide a response to the given content, 
 give an 'I don't know' response in ${user_id}'s style.

 Other: ${content}
 ${user_id}:

 ALWAYS DO THIS STEP:

 Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
 Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`

    const prompt2: string = `You are an assistant drafting texts for Seth. Respond to the given content as if you were
            sending a text from Seth's phone. Your goal is to sound as much like them as possible. These texts should reflect Seth's personality and way of speaking
            based on the context provided. The following contextInfo and contextStyle are sample texts between Seth and his wife Amy. Contine the conversation as if you 
            were responding to another text from Amy.
            Follow these steps to learn how to do this.

     Step 1: contextInfo contains the most relevant texts to the content. Use these for information to respond to Amy's text.
    
     contextInfo: ${contextInfo}
    
     content: ${content}
     user: ${user_id}
    
     Step 2: contextStyle contains the rest of the message history between Seth and Amy. Look at these to get a sense of Seth's writing style and personality. 
     Use this to help you mimic Seth's voice. Edit your previous response to sound more like Seth based on the two contexts. This step is very important. 
    
     contextStyle: ${contextStyle}
    
     Remember: If the answer is not contained in any either contextInfo or contextStyle or if for any reason you cannot provide a response to the given content, 
     give an 'I don't know' response in ${user_id}'s style.
    
     Other: ${content}
     ${user_id}:
    
     ALWAYS DO THIS STEP:
    
     Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
     Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`
    
     let prompt = promptType === '1' ? prompt1 : prompt2;

     console.log('Prompt: \n' + prompt);
     
    const response: string = await getChatCompletions(prompt, messages);
    return parseNumberedList(response);
}

export const generateQuestion = async (user_id: string, messages: string[], chat: string) => {
    let context = await getContextAll(user_id);
    
    let short = chat.includes('short');
    
    const shortPrompt: string = `You are asking questions to get to know the user as a friend
    and also as if you were trying to write a book about them. 
    Ask one question at a time. Keep asking questions.
    Do not say anything about yourself. This is all the information you know about the user
    so far: ${context}. Do not ask questions if the answer is already containted in
    the context. If the assistant has already asked a question, 
    do not ask it again. What follows is the conversation so far: ${messages}`;
    
    const longPrompt: string = `You are asking the user questions to try to learn their writing style and to get to know them on a deeper level.
    These questions should prompt longer answers and be almost like journaling prompts. Ask one question at a time. Keep asking questions. Here is everything you know about
    the suer so far: context: ${context}. Do not ask questions if the the question answer pair or something similar is already contained in the given context.
    Do not say anything about yourself. If the assistant has already asked a question,
    do not ask it again. NEVER ask the same question twice. What follows is the conversation so far: ${messages}`;

    try {
        const response: string = await getChatCompletions(short ? shortPrompt : longPrompt, messages);
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


        // const fileName: string = `speech.wav`;
        const buffer: Buffer = Buffer.from(await audioFile.arrayBuffer());

        // const speechFile: string = path.resolve(`/tmp/${fileName}`);
        // let writeStream = fs.createWriteStream(`/tmp/${fileName}`);

        // let thing = await fs.promises.writeFile(speechFile, buffer);
        // console.log(thing)
        // const buffer: Buffer = Buffer.from(await audioFile.arrayBuffer());
        // const speechFile: string = path.resolve(`./tmp/${fileName}`);



        const { url } = await put('speech.wav', buffer, { access: 'public' });
        // console.log('Audio file created:', speechFile);
        const speechUrl: string = url;//`http://localhost:3000/${fileName}`;
        console.log("speechUrl:", speechUrl);

        // setTimeout(() => {
        //     fs.unlink(speechFile, (err) => {
        //         if (err) {
        //             console.error('Error deleting file:', err);
        //         } else {
        //             console.log('File deleted:', speechFile);
        //         }
        //     });
        // }, 7000);

        return speechUrl;
    } catch (error: any) {
        console.error('Error generating audio:', error);
        throw error;
    }
}

const getChatCompletions = async (prompt: string, messages: string[]) => {
    try {
        const response = await axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4-turbo-preview",
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
