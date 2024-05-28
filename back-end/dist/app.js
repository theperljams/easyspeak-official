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
app.use(express_1.default.static('tmp'));
const cors = require('cors');
app.use(cors());
app.get('/ping', (req, res) => {
    return res.send('pong 🏓');
});
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, messages, /*user_id*/ jwt } = req.body;
    const { access_token } = JSON.parse(jwt);
    const { email: user_id } = yield (0, db_1.getUserData)(access_token);
    console.log(user_id);
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
    //TODO validate user ID with token
    console.log(req);
    try {
        const embeddingResponse = yield (0, llm_1.getEmbedding)(content);
        yield (0, db_1.insertQAPair)(user_id, content, embeddingResponse, table_name);
        res.json('Success');
    }
    catch (error) {
        res.status(500).send('Error inserting into DB');
    }
}));
app.post('/training', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, messages, chat } = req.body;
    if (!messages) {
        return res.status(400).send('Messages are required');
    }
    try {
        const response = yield (0, llm_1.generateQuestion)(user_id, messages, chat);
        res.json(response);
    }
    catch (error) {
        res.status(500).send('Error in training');
    }
}));
app.post('/tts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.body: ", req.body);
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }
    try {
        const response = yield (0, llm_1.generateAudio)(text);
        res.json(response);
        console.log("response: ", response);
    }
    catch (error) {
        res.status(500).send('Error calling TTS API');
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port  ${PORT}`);
});
// import express from "express";
// const app = express();
// const port = 3000;
// app.use(express.static("public"));
// app.get("/", (req, res) => {
//   res.send("Hello world");
// });
// app.listen(port, () => {
//   console.log("Listening now");
// });
//# sourceMappingURL=app.js.map