// server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
// import { processChatCompletion } from './llm'; // Uncomment when implementing response generation

dotenv.config();

const app = express();

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

// In-memory storage for messages
const messages = new Map();

// Handle connections in the Messaging namespace
messagingNamespace.on('connection', (socket) => {
  console.log(`Messaging Client connected: ${socket.id}`);

  socket.on('newMessage', async (data) => {
    const { content, user_id, message_id } = data;

    // Input validation
    if (!content || !user_id || !message_id) {
      socket.emit('error', { error: 'Missing "content", "user_id", or "message_id".' });
      return;
    }

    // Check for duplicate message_id
    if (messages.has(message_id)) {
      socket.emit('error', { error: 'Duplicate "message_id".' });
      return;
    }

    try {
      // Stub for response generation
      const generatedResponses = [
        'This is a stubbed response 1.',
        'This is a stubbed response 2.',
        'This is a stubbed response 3.'
      ];

      // Uncomment and implement the following when ready
      // const generatedResponses = await processChatCompletion(content, user_id);

      if (!generatedResponses || generatedResponses.length === 0) {
        socket.emit('error', { error: 'Failed to generate responses.' });
        return;
      }

      // Store the message and its generated responses in-memory
      messages.set(message_id, {
        content,
        user_id,
        generated_responses: generatedResponses,
        selected_response: null,
        created_at: new Date(),
      });

      console.log(`Generated responses for message_id ${message_id}:`, generatedResponses);

      // Emit 'responsesGenerated' to Front End namespace only
      frontendNamespace.emit('responsesGenerated', {
        message_id,
        responses: generatedResponses,
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

  socket.emit('ack', { message: 'Connected to Back End.' });

  socket.on('submitSelectedResponse', (data) => {
    console.log("made it here");
    const { message_id, selected_response } = data;

    console.log("Message received: ", data);

    // Input validation
    if (!message_id || !selected_response) {
      socket.emit('error', { error: 'Missing "message_id" or "selected_response".' });
      return;
    }

    // Check if the message exists
    if (!messages.has(message_id)) {
      socket.emit('error', { error: 'Message not found.' });
      return;
    }

    const message = messages.get(message_id);

    // Check if a response has already been selected
    if (message.selected_response) {
      socket.emit('error', { error: 'A response has already been selected for this message.' });
      return;
    }

    // Validate that the selected_response is one of the generated_responses
    if (!message.generated_responses.includes(selected_response)) {
      socket.emit('error', { error: 'Selected response is not valid.' });
      return;
    }

    // Update the message with the selected response
    message.selected_response = selected_response;
    messages.set(message_id, message);

    console.log(`Selected response for message_id ${message_id}: ${selected_response}`);

    // Acknowledge the Front End
    socket.emit('responseSubmitted', { message: 'Selected response submitted successfully.' });
    console.log("Message sent: ", message.selected_response);
    // Optional: Notify Messaging Client or perform additional actions (e.g., send response back via Slack)
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
