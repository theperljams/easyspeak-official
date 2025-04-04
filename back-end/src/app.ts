import express, {json} from 'express';
import {insertQAPair, getUserData} from './db';
import { generateAudio } from './llm';

const app = express();
app.use(express.json());
app.use(express.static('tmp'));
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

app.post('/generate', async (req, res) => {
  const { content, messages, /*user_id*/ jwt } = req.body;

  const { access_token } = JSON.parse(jwt);

  const {email: user_id}= await getUserData(access_token);

  if (!content) {
    return res.status(400).send('Question is required');
  }

  if (isTestMode) {
    // Rotate through hardcoded responses in test mode
    const response = hardcodedResponses[responseCounter % hardcodedResponses.length];
    responseCounter++;
    console.log('Returning hardcoded response:', response);
    return res.json(response);
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

  //TODO validate user ID with token

  console.log(req);
  try {
    await insertQAPair(user_id, content, table_name);
    res.json('Success');
  } catch (error) {
    res.status(500).send('Error inserting into DB');
  }
});

app.post('/tts', async (req, res) => {
  console.log("req.body: ", req.body);
  const { text } = req.body;
  if (!text) {
    return res.status(400).send('Text is required');
  }
  try {
    const response = await generateAudio(text);
    res.json(response);
    console.log("response: ", response);
  } catch (error) {
    res.status(500).send('Error calling TTS API');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

