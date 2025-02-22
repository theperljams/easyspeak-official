import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { processChatCompletion } from './llm';
import { generateAudio, generateQuestion, getEmbedding } from './supabase-oai-llm';
import {getUserData, insertQAPair} from './supabase-db';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('tmp'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const messagingNamespace = io.of('/messaging'); // For Messaging Client
const frontendNamespace = io.of('/frontend');   // For MessageChat.tsx

messagingNamespace.on('connection', (socket) => {
  console.log(`Messaging Client connected: ${socket.id}`);

  socket.on('newMessage', async (data) => {
    const { content, timestamp, user_id, hashed_sender_name } = data;

    try {
      const generatedResponses = await processChatCompletion(content, user_id, hashed_sender_name, timestamp, { source: 'slack' });

      // Send the message and responses to the Front End
      frontendNamespace.emit('newMessage', {
        message: content,
        timestamp: timestamp,
        responses: generatedResponses,
        hashed_sender_name: hashed_sender_name,
      });

      // Acknowledge the Messaging Client
      socket.emit('ack', { message: 'Message processed.' });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { error: 'An error occurred while processing the message.' });
    }
  });

  // Listen for 'chatChanged' event from Messaging Client
  socket.on('chatChanged', (data) => {
    const { new_chat_id } = data;
    console.log(`Chat changed to: ${new_chat_id}`);

    // Emit 'chatChanged' event to the Front End
    frontendNamespace.emit('chatChanged', { new_chat_id });

    // Acknowledge the Messaging Client
    socket.emit('ack', { message: 'Chat change processed.' });
  });

  socket.on('disconnect', () => {
    console.log(`Messaging Client disconnected: ${socket.id}`);
  });
});

frontendNamespace.on('connection', (socket) => {
  console.log(`Front End connected: ${socket.id}`);

  socket.on('ack', (data) => {
    console.log(data);
  });

  socket.on('submitSelectedResponse', (data) => {
    const { selected_response, currMessage, messageTimestamp } = data;

    console.log("Received submitSelectedResponse:", data);

    // Acknowledge the Front End
    socket.emit('responseSubmitted', { message: 'Selected response submitted successfully.' });
    console.log("Response submitted to messaging client.");

    // Send the selected response along with the message to the Messaging Client
    messagingNamespace.emit('sendSelectedResponse', {
      'selected_response': selected_response,
      'curr_message': currMessage,
      'message_timestamp': messageTimestamp,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Front End disconnected: ${socket.id}`);
  });
});

app.get('/ping', (req, res) => {
  return res.send('pong 🏓');
});

app.post('/generate', async (req, res) => {
  const { content, messages, jwt } = req.body;

  const { access_token } = JSON.parse(jwt);

  const {email: user_id}= await getUserData(access_token);

  if (!content) {
    return res.status(400).send('Question is required');
  }

  try {
    const openAiResponse = await processChatCompletion(content, user_id, "hashed_sender_name", Date.now(), { source: 'realtime' });
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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

