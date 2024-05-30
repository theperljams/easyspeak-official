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
exports.generateAudio = exports.generateQuestion = exports.generateResponses = exports.getEmbedding = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = require("openai");
const blob_1 = require("@vercel/blob");
const db_1 = require("./db");
const test_db_1 = require("./tests/test_db");
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
const generateResponses = (content, messages, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    let contextShort = [];
    let contextLong = [];
    let contextInfo = [];
    let contextStyle = [];
    let promptType = "";
    if (user_id === "seth@alscrowd.org") {
        contextInfo = (yield (0, db_1.getSethContext)(yield (0, exports.getEmbedding)(content), 10, 0.6));
        contextStyle = (yield (0, db_1.getSethContext)(yield (0, exports.getEmbedding)(content), 90, 0.0));
        promptType = "2";
    }
    else if (user_id === "pearl.k.hulbert@gmail.com") {
        contextInfo = (yield (0, test_db_1.getContext)(yield (0, exports.getEmbedding)(content), 10, 0.6));
        contextStyle = (yield (0, test_db_1.getContext)(yield (0, exports.getEmbedding)(content), 90, 0.0));
        promptType = "3";
    }
    else {
        contextShort = (yield (0, db_1.getContextShort)(yield (0, exports.getEmbedding)(content), user_id));
        contextLong = (yield (0, db_1.getContextLong)(yield (0, exports.getEmbedding)(content), user_id));
    }
    const prompt1 = `You are an assistant drafting texts for ${user_id}. Respond to the given content as if you were
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
 Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
    const prompt2 = `You are an assistant drafting texts for Seth. Respond to the given content as if you were
            sending a text from Seth's phone. Your goal is to sound as much like them as possible. These texts should reflect Seth's personality and way of speaking
            based on the context provided. The following contextInfo and contextStyle are sample texts between Seth and his wife Amy. Contine the conversation as if you 
            were responding to another text from Amy.
            Follow these steps to learn how to do this.

     Step 1: contextInfo contains the most relevant texts to the content. Use these for information to respond to Amy's text.
    
     contextInfo: ${contextInfo}
    
     content: ${content}
    
     Step 2: contextStyle contains the rest of the message history between Seth and Amy. Look at these to get a sense of Seth's writing style and personality. 
     Use this to help you mimic Seth's voice. Edit your previous response to sound more like Seth based on the two contexts. This step is very important. 
    
     contextStyle: ${contextStyle}
    
     Remember: If the answer is not contained in any either contextInfo or contextStyle or if for any reason you cannot provide a response to the given content, 
     give an 'I don't know' response in ${user_id}'s style.
    
     Amy: ${content}
     Seth:
    
     ALWAYS DO THIS STEP:
    
     Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
     Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
    const prompt3 = `You are an assistant drafting texts for Pearl. Respond to the given content as if you were
     sending a text from Pearl's phone. Your goal is to sound as much like them as possible. These texts should reflect Pearl's personality and way of speaking
     based on the context provided. The following contextInfo and contextStyle are sample texts between Pearl and her friend Camille. Contine the conversation as if you 
     were responding to another text from Camille.
     Follow these steps to learn how to do this.

Step 1: contextInfo contains the most relevant texts to the content. Use these for information to respond to Cammile's text.

contextInfo: ${contextInfo}

content: ${content}

Step 2: contextStyle contains the rest of the message history between Pearl and Camille. Look at these to get a sense of Pearl's writing style and personality. 
Use this to help you mimic Pearl's voice. Edit your previous response to sound more like Pearl based on the two contexts. This step is very important. 

contextStyle: ${contextStyle}

Remember: If the answer is not contained in any either contextInfo or contextStyle or if for any reason you cannot provide a response to the given content, 
give an 'I don't know' response in Pearl's style.

Camille: ${content}
Pearl:

ALWAYS DO THIS STEP:

Step 3: Now, take your previous response and come up with 2 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3.  
Treat them as 3 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
    let prompt = '';
    if (promptType === '1') {
        prompt = prompt1;
    }
    else if (promptType === '2') {
        prompt = prompt2;
    }
    else if (promptType === '3') {
        prompt = prompt3;
    }
    const response = yield getChatCompletions(prompt, messages);
    const responseList = parseNumberedList(response);
    console.log('Response:', responseList);
    return responseList;
});
exports.generateResponses = generateResponses;
const generateQuestion = (user_id, messages, chat) => __awaiter(void 0, void 0, void 0, function* () {
    let context = yield (0, db_1.getContextAll)(user_id);
    let short = chat.includes('short');
    const shortPrompt = `You are asking questions to get to know the user as a friend
    and also as if you were trying to write a book about them. 
    Ask one question at a time. Keep asking questions.
    Do not say anything about yourself. This is all the information you know about the user
    so far: ${context}. Do not ask questions if the answer is already containted in
    the context. If the assistant has already asked a question, 
    do not ask it again. What follows is the conversation so far: ${messages}`;
    const longPrompt = `You are asking the user questions to try to learn their writing style and to get to know them on a deeper level.
    These questions should prompt longer answers and be almost like journaling prompts. Ask one question at a time. Keep asking questions. Here is everything you know about
    the suer so far: context: ${context}. Do not ask questions if the the question answer pair or something similar is already contained in the given context.
    Do not say anything about yourself. If the assistant has already asked a question,
    do not ask it again. NEVER ask the same question twice. What follows is the conversation so far: ${messages}`;
    try {
        const response = yield getChatCompletions(short ? shortPrompt : longPrompt, messages);
        return response;
    }
    catch (error) {
        console.error('Error in generateQuestion:', error);
        throw error;
    }
});
exports.generateQuestion = generateQuestion;
const generateAudio = (content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const audioFile = yield openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: content,
        });
        // const fileName: string = `speech.wav`;
        const buffer = Buffer.from(yield audioFile.arrayBuffer());
        // const speechFile: string = path.resolve(`/tmp/${fileName}`);
        // let writeStream = fs.createWriteStream(`/tmp/${fileName}`);
        // let thing = await fs.promises.writeFile(speechFile, buffer);
        // console.log(thing)
        // const buffer: Buffer = Buffer.from(await audioFile.arrayBuffer());
        // const speechFile: string = path.resolve(`./tmp/${fileName}`);
        const { url } = yield (0, blob_1.put)('speech.wav', buffer, { access: 'public' });
        // console.log('Audio file created:', speechFile);
        const speechUrl = url; //`http://localhost:3000/${fileName}`;
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
    }
    catch (error) {
        console.error('Error generating audio:', error);
        throw error;
    }
});
exports.generateAudio = generateAudio;
const getChatCompletions = (prompt, messages) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
            model: "gpt-4o",
            messages: [{ "role": "system", "content": prompt }, ...messages],
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
//# sourceMappingURL=llm.js.map