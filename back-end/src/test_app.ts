import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http, { get } from 'http';
import { Server } from 'socket.io';
import { processChatCompletion } from './llm'; 
import { insertQAPair } from './supabase-db';
import { getEmbedding } from './supabase-oai-llm';

dotenv.config();

const app = express();

// At the very top of server.js
process.env.DEBUG = 'socket.io:*';

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server with namespaces
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your Front End's URL
    methods: ['GET', 'POST'],
  },
});

// Define namespaces
const messagingNamespace = io.of('/messaging'); // For Messaging Client
const frontendNamespace = io.of('/frontend');   // For Front End

// Handle connections in the Messaging namespace
messagingNamespace.on('connection', (socket) => {
  console.log(`Messaging Client connected: ${socket.id}`);

  socket.on('newMessage', async (data) => {
    const { content, user_id } = data;

    // Input validation
    if (!content || !user_id) {
      socket.emit('error', { error: 'Missing "content" or "user_id".' });
      return;
    }

    try {

      const generatedResponses = await processChatCompletion(content, user_id);

      if (!generatedResponses || generatedResponses.length === 0) {
        socket.emit('error', { error: 'Failed to generate responses.' });
        return;
      }

      console.log(`Generated responses:`, generatedResponses);

      // Emit 'responsesGenerated' to Front End namespace only
      frontendNamespace.emit('responsesGenerated', {
        responses: generatedResponses,
        curMessage: content
      });

      // Acknowledge the Messaging Client
      socket.emit('ack', { message: 'Message processed successfully.' });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { error: 'An error occurred while processing the message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Messaging Client disconnected: ${socket.id}`);
  });
});

// Handle connections in the Front End namespace
frontendNamespace.on('connection', (socket) => {
  console.log(`Front End connected: ${socket.id}`);

  socket.on('ack', (data) => { 
    console.log(data); 
  });

  // socket.emit('ack', { message: 'Connected to Back End.' });

  socket.on('submitSelectedResponse', (data) => {
    const { selected_response, currMessage } = data;

    console.log("Message received: ", data);

    // Input validation
    if (!selected_response) {
      socket.emit('error', { error: 'Missing "selected_response".' });
      return;
    }

    console.log(`Selected response: ${selected_response}`);

    // Acknowledge the Front End
    socket.emit('responseSubmitted', { message: 'Selected response submitted successfully.' });
    console.log("Message sent: ", selected_response);

    // Emit the selected response to the /messaging namespace
    messagingNamespace.emit('sendSelectedResponse', {
      'selected_response': selected_response
    });

    let QAPair: string = `message:${currMessage} response:${selected_response}`; 
    insertQAPair("pearl@easyspeak-aac.com" , QAPair, "conversations");
    console.log("QAPair: ", QAPair);

  });

  socket.on('disconnect', () => {
    console.log(`Front End disconnected: ${socket.id}`);
  });
});
// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
