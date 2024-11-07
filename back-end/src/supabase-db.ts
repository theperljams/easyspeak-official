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


export const insertQAPair = async (user_id: string, content: string,  table_name: string, timestamp: number) => {
  console.log(table_name);
  let embedding = await getEmbedding(content);
  try {
    await supabase.from(table_name).insert({
      timestamp,
      user_id,
      content,
      embedding
    });
    
  } catch (error) {
    console.error('Error inserting QA pair into Supabase:', error);
  }
}

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