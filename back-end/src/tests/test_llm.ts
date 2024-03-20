
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

import { put } from "@vercel/blob";

// Assuming these functions exist in './db'
import { getPearlContextAll, getPearlContextLong, getPearlContextShort, getPearlAllLong, getPearlAllShort } from './test_db';

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


// const prompt: string = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

// Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given context below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
// This dataset contains sample texts from ${user_id}. Use them as reference for both basic information and writing style. You speak as ${user_id}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" 

// context: ${contextShort}\n${contextLong}

// content: ${content}
// user: ${user_id}

// Remember: If the answer is not contained the context or if for any reason you cannot provide a response to the given content, 
// give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to based on their writing style.
    
// Other: ${content}
// ${user_id}:
    
// ALWAYS DO THIS STEP:
    
// Step 2: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`


// const prompt: string = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

// Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given contextShort below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
// This dataset mainly contains basic information. You speak as ${user_id}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" 

// contextShort: ${contextShort}

// content: ${content}
// user: ${user_id}

// Step 2: Now, look at this context to learn ${user_id}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic ${user_id}. 
// This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${user_id}.

// contextLong: ${contextLong}

// Remember: If the answer is not contained in any either contextShort or contextLong or if for any reason you cannot provide a response to the given content, 
// give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to.

// Other: ${content}
// ${user_id}:

// ALWAYS DO THIS STEP:

// Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`



//    const prompt: string = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

// Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given context below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
// This dataset contains sample texts from ${user_id}. Use them as reference for both basic information and writing style. You speak as ${user_id}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" 

// context: ${context}

// content: ${content}
// user: ${user_id}

// Remember: If the answer is not contained the context or if for any reason you cannot provide a response to the given content, 
// give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to based on their writing style.
    
// Other: ${content}
// ${user_id}:
    
// ALWAYS DO THIS STEP:
    
// Step 2: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`



export const generateResponses = async (content: string, user_id: string) => {
    let contextShort: string[] = (await getPearlAllShort());
    let contextLong: string[] = (await getPearlAllLong());

    // let context : string[] = (await getPearlContextAll());

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

Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`



    // console.log(prompt);

    const response: string = await getChatCompletions(prompt);
    return parseNumberedList(response);
}

const getChatCompletions = async (prompt: string) => {
    try {
        const response = await axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4-0125-preview",
            messages: [{ "role": "system", "content": prompt }],
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
