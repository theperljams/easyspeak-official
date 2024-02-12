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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("openai");
// Assuming these functions exist in './db'
const db_1 = require("./db");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_CHAT_COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';
const USER_NAME = 'Pearl';
const axiosInstance = axios_1.default.create({
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
});
const openai = new openai_1.OpenAI();
function getEmbedding(content) {
    return __awaiter(this, void 0, void 0, function* () {
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
}
exports.getEmbedding = getEmbedding;
function generateResponses(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let contextShort = (yield (0, db_1.getContextShort)(yield getEmbedding(content)));
        let contextLong = (yield (0, db_1.getContextLong)(yield getEmbedding(content)));
        console.log("SHORT: ", contextShort);
        console.log("LONG: ", contextLong);
        const prompt = `You are an assistant drafting texts for ${USER_NAME}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

    Step 1: Look at the context below to learn how ${USER_NAME} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search the given contextShort below to answer questions. Answer the question as if you were sending a text from ${USER_NAME}'s phone. 
    This dataset mainly contains basic information. The assistant speaks as ${USER_NAME}. For example, if the content contains: "What are you studying?" the assistant will read: "What does ${USER_NAME} say they are studying?" 

    contextShort: ${contextShort}

    content: ${content}
    user: ${USER_NAME}
    
    Step 2: Now, look at this context to learn ${USER_NAME}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic ${USER_NAME}. 
    This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${USER_NAME}.

    contextLong: ${contextLong}
    
    Remember, If the answer is not contained in any either contextShort or contextLong or if for any reason the assistant cannot provide a response to the given content, 
    give an 'I don't know' response that ${USER_NAME} might say if given a question they didn't know the answer to.
    DO NOT, for example, generate something like: "I'm sorry, but I can't provide a response based on the information about Pearl's personal data or opinions on sensitive topics like political beliefs."

    Other: ${content}
    ${USER_NAME}:
    
    Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
        const response = yield getChatCompletions(prompt);
        return parseNumberedList(response);
    });
}
exports.generateResponses = generateResponses;
function generateQuestion(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `You are asking questions to get to know the user as a friend
    and also as if you were trying to write a book about them. 
    Ask one question at a time. Keep asking questions.
    Do not say anything about yourself. If the assistant has asked a question, 
    do not ask it again. What follows is the conversation so far: ${content}`;
        try {
            const response = yield getChatCompletions(prompt);
            return response;
        }
        catch (error) {
            console.error('Error in generateQuestion:', error);
            throw error;
        }
    });
}
exports.generateQuestion = generateQuestion;
function getChatCompletions(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
                model: "gpt-4-0125-preview",
                messages: [{ "role": "user", "content": prompt }],
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error in getChatCompletions:', error);
            throw error;
        }
    });
}
function generateAudio(content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mp3 = yield openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: content,
            });
            const buffer = Buffer.from(yield mp3.arrayBuffer());
            const speechFile = path_1.default.resolve(`./${Date.now()}_speech.mp3`);
            yield fs_1.default.promises.writeFile(speechFile, buffer);
            console.log('Audio file created:', speechFile);
            return speechFile;
        }
        catch (error) {
            console.error('Error generating audio:', error);
            throw error;
        }
    });
}
exports.generateAudio = generateAudio;
function parseNumberedList(inputString) {
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
}
function hasNumericalCharacter(inputString) {
    return /\d/.test(inputString);
}
