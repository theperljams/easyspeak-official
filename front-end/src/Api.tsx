import axios from "axios";

// Define your API endpoint and API key
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const openaiApiKey = 'change this';

// Define your request payload
const requestData = {
  model: 'text-davinci-003', // Use the correct model name
  messages: [
    { role: 'user', content: 'tell me a fact about WWII' },
  ],
};

// Make the API call
const generateInitialQuestion = async () => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    return response;
  } catch (error) {
    console.error('Error making OpenAI request:', error);
    // Handle errors appropriately, e.g., display an error message to the user
  }
};

export default generateInitialQuestion;
