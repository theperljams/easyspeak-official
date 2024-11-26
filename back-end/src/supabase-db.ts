import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getEmbedding } from './llm';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const SIMILARITY_THRESHOLD = 0.1;
const MATCH_COUNT = 50;


// supabase-db.js (or the appropriate file)

export const insertQAPair = async (
  user_id: string,
  content: string,
  table_name: string,
  timestamp: number,
  sender_name: string
) => {
  console.log(table_name);
  let embedding = await getEmbedding(content);
  console.log("Inserting: ", user_id, content, table_name, timestamp, sender_name);
  const {data, error} = await supabase.from(table_name).insert({
      timestamp,
      user_id,
      content,
      embedding,
      sender_name
    });
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Inserted Data:", data);
    }
};

export const getMessagesByHashedSenderName = async (hashed_sender_name, limit) => {
  try {
    let { data, error } = await supabase
      .from('pearl_message_test')
      .select('content') // Only select the 'content' column
      .eq('sender_name', hashed_sender_name)
      .order('timestamp', { ascending: false }) // Optional: Order by timestamp
      .limit(limit);

    if (error) {
      console.error('Error fetching messages by hashed_sender_name:', error);
      return null;
    }

    // Check if data is not null and is an array
    if (Array.isArray(data)) {
      // Transform the data to an array of strings
      const contentArray = data.map((row) => row.content);
      return contentArray;
    } else {
      // If data is null or not an array, return an empty array
      return [];
    }
  } catch (error) {
    console.error('Unexpected error fetching messages by hashed_sender_name:', error);
    return null;
  }
};

export const getCurrentConversationMessages = async () => {
  try {
    // Step 1: Get the timestamp of the most recent message
    let { data: latestMessageData, error: latestMessageError } = await supabase
      .from('pearl_message_test')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (latestMessageError) {
      console.error('Error fetching the latest message timestamp:', latestMessageError);
      return null;
    }

    const latestTimestamp = latestMessageData.timestamp;

    // Calculate the timestamp 5 minutes before the latest timestamp
    const fiveMinutesAgoTimestamp = latestTimestamp - 5 * 60 * 1000; // Subtract 5 minutes in milliseconds

    // Step 2: Get all messages within 5 minutes of the latest timestamp
    let { data: messagesData, error: messagesError } = await supabase
      .from('pearl_message_test')
      .select('content')
      .gte('timestamp', fiveMinutesAgoTimestamp)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages within 5 minutes:', messagesError);
      return null;
    }

    // Transform the data to an array of strings
    const contentArray = messagesData.map((row) => row.content);

    return contentArray;
  } catch (error) {
    console.error('Unexpected error fetching current conversation messages:', error);
    return null;
  }
};

export const getCurrentConversationMessagesBySender = async (hashed_sender_name) => {
  try {
    // Step 1: Get the timestamp of the most recent message from the specific sender
    let { data: latestMessageData, error: latestMessageError } = await supabase
      .from('pearl_message_test')
      .select('timestamp')
      .eq('sender_name', hashed_sender_name)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (latestMessageError) {
      console.error('Error fetching the latest message timestamp for the sender:', latestMessageError);
      return null;
    }

    if (!latestMessageData) {
      console.log('No messages found for the specified sender.');
      return [];
    }

    const latestTimestamp = latestMessageData.timestamp;

    // Calculate the timestamp 5 minutes before the latest timestamp
    const fiveMinutesAgoTimestamp = latestTimestamp - 5 * 60 * 1000; // Subtract 5 minutes in milliseconds

    // Step 2: Get all messages within 5 minutes of the latest timestamp
    let { data: messagesData, error: messagesError } = await supabase
      .from('pearl_message_test')
      .select('content')
      .gte('timestamp', fiveMinutesAgoTimestamp)
      .lte('timestamp', latestTimestamp)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages within 5 minutes of the sender\'s latest message:', messagesError);
      return null;
    }

    // Transform the data to an array of strings
    const contentArray = messagesData.map((row) => row.content);

    return contentArray;
  } catch (error) {
    console.error('Unexpected error fetching current conversation messages by sender:', error);
    return null;
  }
};



export const getMessagesUpToTimestamp = async (timestamp, limit) => {
  try {
    let { data, error } = await supabase
      .from('pearl_message_test')
      .select('*')
      .lte('timestamp', timestamp)
      .order('timestamp', { ascending: false }) // Optional: Order by timestamp
      .limit(limit);

    if (error) {
      console.error('Error fetching messages up to timestamp:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching messages up to timestamp:', error);
    return null;
  }
};

export const getContextAll = async (user_id: string) => {
  try {
    const { data: longData, error: longError } = await supabase
      .from('long')
      .select('*')
      .eq('user_id', user_id);

    const { data: shortData, error: shortError } = await supabase
      .from('short')
      .select('*')
      .eq('user_id', user_id);

    if (longError || shortError) {
      throw new Error('Error fetching data from Supabase');
    }
    
    let result: Array<string> = [];
    for (const i in shortData) result.push(shortData[i].content);
    for (const j in longData) result.push(longData[j].content);

    return result;
  } catch (error) {
    throw error;
  }
}

export const getSethContext = async (embedding: number[], match: number, similarity: number) => {
  try {
    const { data, error } = await supabase.rpc('match_sethxamy', {
      match_count: match,
      query_embedding: embedding,
      similarity_threshold: similarity,
    });
    
    let result: Array<string> = [];
    for (const i in data) result.push(data[i].content);
    return result;
    
  } catch (error) {
    throw error;
  }
}

export const getContextLong = async (embedding: number[], user_id: string) => {
  try {
    const { data, error } = await supabase.rpc('match_long', {
      match_count: MATCH_COUNT,
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      userid: user_id
    });
    
    let result: Array<string> = [];
    for (const i in data) result.push(data[i].content);
    return result;
    
  } catch (error) {
    throw error;
  }
}

export const getContextConversation = async (embedding: number[], user_id: string) => {
  try {
    const { data, error } = await supabase.rpc('match_conversations', {
      match_count: MATCH_COUNT,
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      userid: user_id
    });
    
    let result: Array<string> = [];
    for (const i in data) result.push(data[i].content);
    return result;
    
  } catch (error) {
    throw error;
  }
}

export const getUserData = async (token: string) => {
  const { data: { user } } = await supabase.auth.getUser(token);

  return user;
}