import readline from 'readline';
import { generateResponses } from './test_llm';

const questions = ["Tell me about your family", "How many siblings do you have", "What is your favorite movie", "What are you doing this weekend", "How was your week",
"Oh my gosh I am so exhausted right now", "Work was really stressful and I wanna cry", "Are you reading any good books right now?", "Are you going to family dinner tonight?"];
const user_id = "Pearl";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptUser = () => {
  rl.question('Question: ', async (input) => {
    const startTime = Date.now();
    try {
      const response = await generateResponses(input, user_id);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
    promptUser();
  });
};

const askPredefinedQuestions = async () => {
  for (const question of questions) {
    const startTime = Date.now();
    console.log("Question:", question);
    try {
      const response = await generateResponses(question, user_id);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

const start = () => {
  rl.question('Choose mode (1 for predefined questions, 2 for manual input): ', (mode) => {
    if (mode === '1') {
      rl.close();
      askPredefinedQuestions();
    } else if (mode === '2') {
      promptUser();
    } else {
      console.log("Invalid choice. Please enter 1 or 2.");
      start();
    }
  });
};

start();
