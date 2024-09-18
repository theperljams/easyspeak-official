"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponses = exports.getEmbedding = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = require("openai");
const test_db_1 = require("./test_db");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_CHAT_COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';
const axiosInstance = axios_1.default.create({
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
});
const openai = new openai_1.OpenAI();
const getEmbedding = (content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axiosInstance.post(OPENAI_EMBEDDING_URL, {
            model: "text-embedding-ada-002",
            input: content,
            encoding_format: "float",
        });
        return response.data.data[0].embedding;
    }
    catch (error) {
        console.error('Error in getEmbedding:', error);
        throw error;
    }
});
exports.getEmbedding = getEmbedding;
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
//        const prompt2: string = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.
// Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. 
// You can also search the given context below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
// This dataset contains sample texts from ${user_id}. Use them as reference for both basic information and writing style. 
// Pay very close attention to the writing style, getting it right is very important. Err on the side of being concise and casual. You speak as ${user_id}. 
// For example, if the content contains: "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" 
// context: ${context}
// content: ${content}
// user: ${user_id}
// Remember: If the answer is not contained the context or if for any reason you cannot provide a response to the given content, 
// give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to based on their writing style.
// Other: ${content}
// ${user_id}:
// ALWAYS DO THIS STEP:
// Step 2: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
// Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`
// const prompt1: string = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
// //         sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
// //         based on the context provided.
// //         You speak as ${user_id}. For example, if the content contains: 
// //         "What are you studying?" the assistant will read: "What does ${user_id} say they are studying?" Stay true to what is found in the context. If you see a similar question, and answer exchange, 
// //         use that as a guide.
// //         Follow these steps to learn how to do this.
// // Step 1: Search the given contextShort below to learn basic information about the user and how they respond to casual questions.
// // Lean more into the style shown in this database for casual conversations with relatively simple responses.
// // contextShort: ${contextShort}
// // content: ${content}
// // user: ${user_id}
// // Step 2: Now, look at contextLong to learn ${user_id}'s writing style. This dataset contains answers that are more like journal entries. 
// // Lean more into this style when doing thing like telling stories, expressing emotion, or having deeper conversations.
// // If there is information relevant to responding to the content, use it in your response.
// // If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${user_id}. 
// // This step is very important. These texts need to sound as much like ${user_id} as possible. Err on being more concise and casual.
// // contextLong: ${contextLong}
// // Remember: If the answer is not contained in any either contextShort or contextLong or if for any reason you cannot provide a response to the given content, 
// // give an 'I don't know' response in ${user_id}'s style.
// // Other: ${content}
// // ${user_id}:
// // ALWAYS DO THIS STEP:
// // Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
// // Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`
const generateResponses = (content, user_id, promptType) => __awaiter(void 0, void 0, void 0, function* () {
    let startTime, endTime;
    //    // Timing for getContextShort
    //    startTime = new Date();
    //    let contextShort: string[] = await getContextShort(await getEmbedding(content), user_id);
    //    endTime = new Date();
    // //    console.log('Time taken for getContextShort:', (endTime.getTime() - startTime.getTime()) / 1000, 'seconds');
    //    // Timing for getContextLong
    //    startTime = new Date();
    //    let contextLong: string[] = await getContextLong(await getEmbedding(content), user_id);
    //    endTime = new Date();
    // //    console.log('Time taken for getContextLong:', (endTime.getTime() - startTime.getTime()) / 1000, 'seconds');
    let contextInfo = yield (0, test_db_1.getContext)(yield (0, exports.getEmbedding)(content), 10, 0.6);
    let contextStyle = yield (0, test_db_1.getContext)(yield (0, exports.getEmbedding)(content), 90, 0.0);
    // let personalContext: string[] = await getContextAll("pearl.k.hulbert@gmail.com");
    // Step 1: review the personalContext for some basic information about Pearl that you can use to help you answer Camille's text.
    // personalContext: ${personalContext}
    const prompt1 = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
            sending a text from ${user_id}'s phone. Your goal is to sound as much like them as possible. These texts should reflect ${user_id}'s personality and way of speaking
            based on the context provided. The following contextInfo and contextStyle are sample texts between Pearl and her friend Camille. Contine the conversation as if you 
            were responding to another text from Camille.
            Follow these steps to learn how to do this.

     Step 1: contextInfo contains the most relevant texts to the content. Use these for information to respond to Camille's text.
    
     contextInfo: ${contextInfo}
    
     content: ${content}
     user: ${user_id}
    
     Step 2: contextStyle contains the rest of the message history between Pearl and Camille. Look at these to get a sense of Pearl's writing style and personality. 
     Use this to help you mimic Pearl's voice. Edit your previous response to sound more like Pearl based on the two contexts. This step is very important. 
    
     contextStyle: ${contextStyle}
    
     Remember: If the answer is not contained in any either contextInfo or contextStyle or if for any reason you cannot provide a response to the given content, 
     give an 'I don't know' response in ${user_id}'s style.
    
     Other: ${content}
     ${user_id}:
    
     ALWAYS DO THIS STEP:
    
     Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
     Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
    const prompt2 = `You are an assistant drafting texts for ${user_id}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

 Step 1: Look at the context below to learn how ${user_id} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. 
 You can also search the given context below to answer questions. Answer the question as if you were sending a text from ${user_id}'s phone. 
 This dataset contains sample texts between ${user_id} and her friend Camille. Use these as a reference for how Pearl texts.
 Pay very close attention to the writing style, getting it right is very important. Err on the side of being concise and casual. The content is another text from Camille. 
 Continue the converstaion as if you were Pearl conversing with Camille.

 context: ${contextStyle}

 content: ${content}
 user: ${user_id}

 Remember: If the answer is not contained the context or if for any reason you cannot provide a response to the given content, 
 give an 'I don't know' response that ${user_id} might say if given a question they didn't know the answer to based on their writing style.
    
 Camille: ${content}
 ${user_id}:
    
 ALWAYS DO THIS STEP:
    
 Step 2: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
 Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
    let prompt = promptType === '1' ? prompt1 : prompt2;
    // console.log(prompt);
    startTime = new Date();
    const response = yield getChatCompletions(prompt);
    endTime = new Date();
    console.log('Time taken for getChatCompletions:', (endTime.getTime() - startTime.getTime()) / 1000, 'seconds');
    return parseNumberedList(response);
});
exports.generateResponses = generateResponses;
const getChatCompletions = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4o-mini",
            messages: [{ "role": "system", "content": prompt }],
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error('Error in getChatCompletions:', error);
        throw error;
    }
});
const parseNumberedList = (inputString) => {
    if (!hasNumericalCharacter(inputString)) {
        return [inputString];
    }
    const lines = inputString.trim().split('\n');
    const items = [];
    for (const line of lines) {
        const parts = line.split('. ', 2);
        if (parts.length === 2 && !isNaN(parseInt(parts[0], 10))) {
            const itemContent = parts[1].trim();
            items.push(itemContent);
        }
    }
    return items;
};
const hasNumericalCharacter = (inputString) => {
    return /\d/.test(inputString);
};
//# sourceMappingURL=test_llm.js.map