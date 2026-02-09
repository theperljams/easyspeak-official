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
const isTestMode = process.env.TEST_MODE === 'true';
// Define an array of hardcoded responses
const hardcodedResponses = [
    ['Response set 1 - Response 1', 'Response set 1 - Response 2', 'Response set 1 - Response 3'],
    ['Response set 2 - Response 1', 'Response set 2 - Response 2', 'Response set 2 - Response 3'],
    ['Response set 3 - Response 1', 'Response set 3 - Response 2', 'Response set 3 - Response 3']
];
let responseCounter = 0;
app.get('/ping', (req, res) => {
    return res.send('pong 🏓');
});
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, messages, jwt } = req.body;
        if (!content) {
            return res.status(400).send('Question is required');
        }
        if (!jwt) {
            return res.status(401).send('JWT is required');
        }
        let access_token;
        try {
            const parsedJwt = JSON.parse(jwt);
            if (!parsedJwt || !parsedJwt.access_token) {
                return res.status(401).send('Invalid JWT format');
            }
            access_token = parsedJwt.access_token;
        }
        catch (parseError) {
            console.error('JWT parse error:', parseError);
            return res.status(401).send('Invalid JWT');
        }
        const userData = yield (0, db_1.getUserData)(access_token);
        if (!userData || !userData.email) {
            return res.status(401).send('Invalid user');
        }
        const user_id = userData.email;
        if (isTestMode) {
            // Rotate through hardcoded responses in test mode
            const response = hardcodedResponses[responseCounter % hardcodedResponses.length];
            responseCounter++;
            console.log('Returning hardcoded response:', response);
            return res.json(response);
        }
        const openAiResponse = yield (0, llm_1.generateResponses)(content, messages, user_id);
        res.json(openAiResponse);
    }
    catch (error) {
        console.error('Error in /generate:', error);
        res.status(500).send('Error generating responses');
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
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map