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
const openai_1 = require("./openai");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question } = req.body;
    if (!question) {
        return res.status(400).send('Question is required');
    }
    try {
        const openAiResponse = yield (0, openai_1.generateResponses)(question);
        res.json(openAiResponse);
    }
    catch (error) {
        res.status(500).send('Error calling OpenAI API');
    }
}));
app.post('/tts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
