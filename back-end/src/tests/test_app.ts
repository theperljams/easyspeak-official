import readline from 'readline';
import { generateResponses } from './test_llm';
import { processChatCompletion } from '../llm';

// Commented-out question arrays remain unchanged
// const questions = ["Tell me about your family", ...];
// const questions = ["Tell me about yourself", ...];

const questions = [
  "How did your party go?",
  "Hey girl, are we meeting today?",
  "Did Brendan say he was working with us?",
  "Is Sid coming?",
  "Is Brendan gonna work with us?",
  "Where r we meeting?",
  "R u going to class?",
  "How are you doing?",
  "Are you dating anyone rn?",
  "What are your plans for the weekend?",
  "Are you reading any good books right now?",
  "How's Ashley doing?"
];

// Removed the hardcoded user_id
// const user_id = "Pearl";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptUser = (user_id: string) => {
  rl.question('Question: ', async (input) => {
    const startTime = Date.now();
    try {
      const response = await processChatCompletion(input, user_id, "ceb1a2d1a186721f8719ad5f8106b55662ed21798c962a5ab6b686bc345dec0e", 2);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
    promptUser(user_id); // Continue prompting the user
  });
};

const askPredefinedQuestions = async (user_id: string) => {
  for (const question of questions) {
    const startTime = Date.now();
    console.log("Question:", question);
    try {
      const response = await processChatCompletion(question, user_id, "7a7ba7c0197cf6d2b0dccb6a6fe451e9e34b396137f9661db53a98c23a89bb8f", 2);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  rl.close(); // Close the readline interface after processing all questions
};

const start = () => {
  rl.question('Choose mode (1 for predefined questions, 2 for manual input): ', (mode) => {
    if (mode === '1' || mode === '2') {
      rl.question('Enter user ID: ', (userInput) => {
        const user_id = userInput.trim();
        if (mode === '1') {
          askPredefinedQuestions(user_id);
        } else if (mode === '2') {
          promptUser(user_id);
        }
      });
    } else {
      console.log("Invalid mode choice. Please enter 1 or 2.");
      start(); // Restart if invalid mode is entered
    }
  });
};

start();
