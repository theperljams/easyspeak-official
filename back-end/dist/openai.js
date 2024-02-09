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
exports.generateResponses = void 0;
const axios_1 = __importDefault(require("axios"));
const supa_1 = require("./supa");
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
function generateResponses(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let contextShort = yield (0, supa_1.getContextShort)(yield getEmbedding(content));
        let contextLong = yield (0, supa_1.getContextLong)(yield getEmbedding(content));
        const prompt = `You are an assistant drafting texts for ${USER_NAME}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

  Step 1: Look at the context below to learn how ${USER_NAME} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search this context below to answer questions. Answer the question as if you were sending a text from ${USER_NAME}'s phone. 
  This dataset mainly contains basic information. You = ${USER_NAME}. For example, if someone asks: "What are you studying?" think of the question as: "What does ${USER_NAME} say they are studying?" 
  If the answer is not contained in the context, just say that you don't know. Don't add additional answers that don't answer the question.

  Context: ${contextShort}

  Other: ${content}
  ${USER_NAME}:
  
  Step 2: Now, look at this context to learn ${USER_NAME}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic ${USER_NAME}. 
  This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like ${USER_NAME}.

  ${contextLong}

  Other: ${content}
  ${USER_NAME}:
  
  Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this.`;
        const responses = yield getChatCompletions(prompt);
        console.log("RESPONSES: ", responses, "\n\n");
        return responses;
    });
}
exports.generateResponses = generateResponses;
function getChatCompletions(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axiosInstance.post(OPENAI_CHAT_COMPLETION_URL, {
                model: "gpt-4-0125-preview",
                messages: [{ "role": "user", "content": prompt }],
                stream: true,
            });
            const responseList = response.data.choices.map((choice) => choice.delta.content).filter((content) => content != null);
            return responseList.join('');
        }
        catch (error) {
            console.error('Error in getChatCompletions:', error);
            throw error;
        }
    });
}
