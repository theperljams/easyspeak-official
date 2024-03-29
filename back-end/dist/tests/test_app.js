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
const readline_1 = __importDefault(require("readline"));
const test_llm_1 = require("./test_llm");
// const questions = ["Tell me about your family", "How many siblings do you have", "What is your favorite movie", "What are you doing this weekend", "How was your week",
// "Oh my gosh I am so exhausted right now", "Work was really stressful and I wanna cry", "Are you reading any good books right now?", "Are you going to family dinner tonight?"];
// const questions = ["Tell me about yourself", "How's school going?", "What are you studying?", "What is your favorite book?", "Oh my gosh I am so exhausted right now", "What has been the best vacation you've ever been on?",
// "Work was really stressful and I wanna cry", "Are you reading any good books right now?", "Are you going to family dinner tonight?"]
const questions = ["How did your party go?", "Hey girl, are we meeting today?", "Did Brendan say he was working with us?", "Is Sid coming?", "Is Brendan gonna work with us?",
    "Where r we meeting?", "R u going to class?", "How are you doing?", "Are you dating anyone rn?", "What are your plans for the weekend?",
    "Are you reading any good books right now?", "How's Ashley doing?"];
const user_id = "Pearl";
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const promptUser = (promptType) => {
    rl.question('Question: ', (input) => __awaiter(void 0, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            const response = yield (0, test_llm_1.generateResponses)(input, user_id, promptType);
            const endTime = Date.now();
            console.log("Response:", response);
            console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
        }
        catch (error) {
            console.error("Error:", error);
        }
        promptUser(promptType);
    }));
};
const askPredefinedQuestions = (promptType) => __awaiter(void 0, void 0, void 0, function* () {
    for (const question of questions) {
        const startTime = Date.now();
        console.log("Question:", question);
        try {
            const response = yield (0, test_llm_1.generateResponses)(question, user_id, promptType);
            const endTime = Date.now();
            console.log("Response:", response);
            console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
        }
        catch (error) {
            console.error("Error:", error);
        }
    }
});
const start = () => {
    rl.question('Choose mode (1 for predefined questions, 2 for manual input): ', (mode) => {
        if (mode === '1' || mode === '2') {
            rl.question('Choose prompt type (1 or 2): ', (promptType) => {
                if (promptType === '1' || promptType === '2') {
                    if (mode === '1') {
                        rl.close();
                        askPredefinedQuestions(promptType);
                    }
                    else if (mode === '2') {
                        promptUser(promptType);
                    }
                }
                else {
                    console.log("Invalid prompt type. Please enter 1 or 2.");
                    start();
                }
            });
        }
        else {
            console.log("Invalid mode choice. Please enter 1 or 2.");
            start();
        }
    });
};
start();
//# sourceMappingURL=test_app.js.map