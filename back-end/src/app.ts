import express from 'express';
import { generateAudio, generateQuestion, generateResponses, getEmbedding } from './llm';
import { insertQAPair } from './db';

const app = express();
app.use(express.json());
const cors = require('cors');

// Use CORS middleware
app.use(cors());

app.post('/generate', async (req, res) => {
  const { content, messages, user_id } = req.body;
  if (!content) {
    return res.status(400).send('Question is required');
  }

  try {
    const openAiResponse = await generateResponses(content, messages, user_id);
    res.json(openAiResponse);
  } catch (error) {
    res.status(500).send('Error calling OpenAI API');
  }
});

app.post('/insert', async (req, res) => { 
  const {user_id, table_name, content} = req.body;
  try {
    const embeiddingResponse = await getEmbedding(content);
    await insertQAPair(user_id, content, embeiddingResponse, table_name);
    res.json('Success');
  } catch (error) {
    res.status(500).send('Error inserting into DB');
  }
});

app.post('/training', async (req, res) => { 
  const { messages } = req.body;
    if (!messages) {
      return res.status(400).send('Messages are required');
    }
    try {
      const response = await generateQuestion(messages);
      res.json(response);
    } catch (error) {
      res.status(500).send('Error in training')
    }
    
});

app.post('/tts', async (req, res) => { 
    const { text } = req.body;
    if (!text) {
      return res.status(400).send('Text is required');
    }
    try {
      const response = await generateAudio(text);
      res.json(response);
    } catch (error) {
      res.status(500).send('Error calling TTS API');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port  ${PORT}`);
});
