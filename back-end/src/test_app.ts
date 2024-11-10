// server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { processChatCompletion } from './llm';
import { insertQAPair } from './supabase-db';

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

// Initialize the message-response queue
let messageQueue = [];

// Handle connections in the Messaging namespace
messagingNamespace.on('connection', (socket) => {
  console.log(`Messaging Client connected: ${socket.id}`);

  socket.on('newMessage', async (data) => {
    const { content, timestamp, user_id, hashed_sender_name } = data;
    console.log("Received newMessage:", data);

    // Input validation
    if (!content || !user_id || !timestamp || !hashed_sender_name) {
      socket.emit('error', { error: 'Missing required fields in "newMessage" event.' });
      return;
    }

    try {
      // Process the message to generate responses
      const generatedResponses = await processChatCompletion(content, user_id, hashed_sender_name, timestamp);

      if (!generatedResponses || generatedResponses.length === 0) {
        socket.emit('error', { error: 'Failed to generate responses.' });
        return;
      }

      console.log(`Generated responses:`, generatedResponses);

      // Add the message, timestamp, and responses to the queue
      messageQueue.push({
        message: content,
        timestamp: timestamp,
        responses: generatedResponses,
        hashed_sender_name: hashed_sender_name,
      });

      // Send the message and responses to the Front End
      frontendNamespace.emit('newMessage', {
        message: content,
        timestamp: timestamp,
        responses: generatedResponses,
        hashed_sender_name: hashed_sender_name,
      });

      // Acknowledge the Messaging Client
      socket.emit('ack', { message: 'Message processed and stored in queue.' });
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

  socket.on('submitSelectedResponse', (data) => {
    const { selected_response, currMessage, messageTimestamp } = data;

    console.log("Received submitSelectedResponse:", data);

    // Input validation
    if (!selected_response || !messageTimestamp) {
      socket.emit('error', { error: 'Missing "selected_response" or "messageTimestamp".' });
      return;
    }

    console.log(`Selected response: ${selected_response}`);
    console.log(`Current message: ${currMessage}`);

    // Acknowledge the Front End
    socket.emit('responseSubmitted', { message: 'Selected response submitted successfully.' });
    console.log("Response submitted to messaging client.");

    // Send the selected response along with the message to the messaging client
    messagingNamespace.emit('sendSelectedResponse', {
      'selected_response': selected_response,
      'curr_message': currMessage,
      'message_timestamp': messageTimestamp,
    });

    // Retrieve the message from the queue to get hashed_sender_name
    const messageItem = messageQueue.find(
      (item) => item.timestamp === messageTimestamp
    );

    let QAPair = "";

    if (!currMessage) {
      QAPair = `started conversation with: ${selected_response}`;
    } else {
      QAPair = `message: ${currMessage} response: ${selected_response}`;
    }

    if (messageItem) {
      const { hashed_sender_name } = messageItem;

      // Insert the Q&A pair into the database
      insertQAPair(
        "pearl@easyspeak-aac.com",
        QAPair,
        "pearl_message_test",
        messageTimestamp,
        hashed_sender_name
      );
      console.log("QAPair inserted into database: ", QAPair);
    } else {
      console.error('Message not found in queue for timestamp:', messageTimestamp);
    }

    // Remove the message from the queue
    messageQueue = messageQueue.filter(
      (item) => item.timestamp !== messageTimestamp
    );

    // Optionally, send updated queue to front end
    // frontendNamespace.emit('messageQueueUpdate', { messageQueue: messageQueue });

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
