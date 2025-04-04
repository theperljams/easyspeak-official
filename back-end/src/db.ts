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

export const insertQAPair = async (
  user_id: string,
  content: string,
  table_name: string,
) => {
  console.log(table_name);
  let embedding = await getEmbedding(content);
  console.log("Inserting: ", user_id, content, table_name);
  const {data, error} = await supabase.from(table_name).insert({
      user_id,
      content,
      embedding
    });
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Inserted Data:", data);
    }
};

export const getContextCurrent = async (embedding: number[], user_id: string, match: number, similarity: number) => {
  try {
    const { data, error } = await supabase.rpc('match_current', {
      match_count: match,
      query_embedding: embedding,
      similarity_threshold: similarity,
      userid: user_id
    });
    
    let result: Array<string> = [];
    for (const i in data) result.push(data[i].content);
    return result;
    
  } catch (error) {
    throw error;
  }
}

export const getContextLegacy = async (embedding: number[], user_id: string, match: number, similarity: number) => {
  try {
    const { data, error } = await supabase.rpc('match_legacy', {
      match_count: match,
      query_embedding: embedding,
      similarity_threshold: similarity,
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