import express, {json} from 'express';
import { generateAudio, generateQuestion, generateResponses, getEmbedding } from './llm';
import {getContextAll, getUserData, insertQAPair} from './db';

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
    } catch (parseError) {
      console.error('JWT parse error:', parseError);
      return res.status(401).send('Invalid JWT');
    }

    const userData = await getUserData(access_token);
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

    const openAiResponse = await generateResponses(content, messages, user_id);
    res.json(openAiResponse);
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).send('Error generating responses');
  }
});

app.post('/insert', async (req, res) => {

  const {user_id, table_name, content} = req.body;

  //TODO validate user ID with token

  console.log(req);
  try {
    const embeddingResponse = await getEmbedding(content);
    await insertQAPair(user_id, content, embeddingResponse, table_name);
    res.json('Success');
  } catch (error) {
    res.status(500).send('Error inserting into DB');
  }
});

app.post('/training', async (req, res) => {
  const { user_id, messages, chat } = req.body;
  if (!messages) {
    return res.status(400).send('Messages are required');
  }
  try {
    const response = await generateQuestion(user_id, messages, chat);
    res.json(response);
  } catch (error) {
    res.status(500).send('Error in training')
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

