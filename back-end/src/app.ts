import express, {json} from 'express';
import { generateAudio, generateQuestion, generateResponses, getEmbedding } from './llm';
import {getContextAll, getUserData, insertQAPair} from './db';

const app = express();
app.use(express.json());
app.use(express.static('tmp'));
const cors = require('cors');


app.use(cors());

app.get('/ping', (req, res) => {
  return res.send('pong 🏓')
})

app.post('/generate', async (req, res) => {
  const { content, messages, /*user_id*/ jwt } = req.body;

  const { access_token } = JSON.parse(jwt);

  const {email: user_id}= await getUserData(access_token);
  console.log(user_id)

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
  console.log(`Server is running on port  ${PORT}`);
});
// import express from "express";

// const app = express();
// const port = 3000;

// app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// app.listen(port, () => {
//   console.log("Listening now");
// });
