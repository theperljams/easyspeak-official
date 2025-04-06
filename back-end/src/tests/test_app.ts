import readline from 'readline';
import { processChatCompletion } from '../llm';
import { prompts } from '../prompts/textGeneration';

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

const promptUser = (user_id: string, promptType: keyof typeof prompts) => {
  rl.question('Question: ', async (input) => {
    const startTime = Date.now();
    try {
      const response = await processChatCompletion(input, user_id);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
    promptUser(user_id, promptType);
  });
};

const askPredefinedQuestions = async (user_id: string, promptType: keyof typeof prompts) => {
  for (const question of questions) {
    const startTime = Date.now();
    console.log("Question:", question);
    try {
      const response = await processChatCompletion(question, user_id);
      const endTime = Date.now();
      console.log("Response:", response);
      console.log(`Response time: ${(endTime - startTime) / 1000} seconds`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  rl.close();
};

const start = () => {
  rl.question('Choose mode (1 for predefined questions, 2 for manual input): ', (mode) => {
    if (mode === '1' || mode === '2') {
      rl.question('Choose prompt type (default/concise): ', (promptType) => {
        if (!['default', 'concise'].includes(promptType)) {
          console.log("Invalid prompt type. Using default.");
          promptType = 'default';
        }
        
        rl.question('Enter user email: ', (userInput) => {
          const user_id = userInput.trim() || "test@example.com";
          if (mode === '1') {
            askPredefinedQuestions(user_id, promptType as keyof typeof prompts);
          } else {
            promptUser(user_id, promptType as keyof typeof prompts);
          }
        });
      });
    } else {
      console.log("Invalid mode choice. Please enter 1 or 2.");
      start();
    }
  });
};

start();
