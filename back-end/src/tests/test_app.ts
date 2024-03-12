import readline from 'readline';
import { generateResponses } from './test_llm'; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptUser = (): void => {
  rl.question('Question: ', async (input: string) => {
    // Assuming user_id is "Pearl" and messages is an array with an empty string
    const user_id = "Pearl";

    try {
      const response = await generateResponses(input, user_id);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error:", error);
    }

    promptUser(); // Re-prompt after handling the question
  });
};

promptUser(); // Start the question loop
