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
const express_1 = __importDefault(require("express"));
const llm_1 = require("./llm");
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const cors = require('cors');
// Use CORS middleware
app.use(cors());
app.get('/ping', (req, res) => {
    return res.send('pong 🏓');
});
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, messages, user_id } = req.body;
    if (!content) {
        return res.status(400).send('Question is required');
    }
    try {
        const openAiResponse = yield (0, llm_1.generateResponses)(content, messages, user_id);
        res.json(openAiResponse);
    }
    catch (error) {
        res.status(500).send('Error calling OpenAI API');
    }
}));
app.post('/insert', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, table_name, content } = req.body;
    try {
        const embeiddingResponse = yield (0, llm_1.getEmbedding)(content);
        yield (0, db_1.insertQAPair)(user_id, content, embeiddingResponse, table_name);
        res.json('Success');
    }
    catch (error) {
        res.status(500).send('Error inserting into DB');
    }
}));
app.post('/training', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages } = req.body;
    if (!messages) {
        return res.status(400).send('Messages are required');
    }
    try {
        const response = yield (0, llm_1.generateQuestion)(messages);
        res.json(response);
    }
    catch (error) {
        res.status(500).send('Error in training');
    }
}));
app.post('/tts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }
    try {
        const response = yield (0, llm_1.generateAudio)(text);
        res.json(response);
    }
    catch (error) {
        res.status(500).send('Error calling TTS API');
    }
}));
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port  ${PORT}`);
});
//# sourceMappingURL=app.js.map