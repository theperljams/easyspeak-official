import express from 'express';
import dotenv from 'dotenv';
import { processChatCompletion } from './llm';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('tmp'));
const cors = require('cors');


app.use(cors());


// Endpoint to generate the assistant's response
app.post('/generate', async (req, res) => {
  const { content, user_id } = req.body;

  if (!content || !user_id) {
    return res.status(400).json({ error: 'Both "content" and "user_id" are required in the request body.' });
  }

  try {
    const chatResponse = await processChatCompletion(content, user_id);
    res.json({ response: chatResponse });
  } catch (error) {
    console.error('Error processing chat completion:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// Endpoint to get the latest message from the client
app.get('/get-latest-message', (req, res) => {
  // Find the latest message without a selected response
  const pendingMessages = Object.entries(messages)
    .filter(([message_id, data]) => data.generated_responses && !data.selected_response)
    .sort((a, b) => Number(b[0]) - Number(a[0]));

  if (pendingMessages.length > 0) {
    const [latestMessageId, latestMessageData] = pendingMessages[0];
    res.json({
      message_id: latestMessageId,
      message: latestMessageData.content,
    });
  } else {
    res.status(404).json({ error: 'No new messages.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
