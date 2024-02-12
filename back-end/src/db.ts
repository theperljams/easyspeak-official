import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

console.log(SUPABASE_URL)

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const SIMILARITY_THRESHOLD = 0.1;
const MATCH_COUNT = 10;


export async function insertQAPair(user_id: string, content: string, embedding: number[], table_name: string): Promise<void> {
  try {
    const { error } = await supabase.from(table_name).insert({
      user_id,
      content,
      embedding
    });

    if (error) {
      throw error;
    }

    console.log('Question-answer pair inserted successfully');
  } catch (error) {
    console.error('Error inserting QA pair into Supabase:', error);
  }
}

export async function getContextLong(embedding: number[], user_id: string): Promise<any> {
  let { data, error } = await supabase
    .rpc('match_long', {
      match_count: MATCH_COUNT,
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      user_id: user_id
    });

  if (error) {
    console.error('Error in getContextLong:', error);
    throw error;
  } else {
    // console.log('Data from getContextLong:', data);
    
    let result: Array<string> = [];
    
    for (const i in data) {
      result.push(data[i].content);
    }
    
    return result;
  }
}

export async function getContextShort(embedding: number[], user_id: string): Promise<any> {
  let { data, error } = await supabase
    .rpc('match_short', {
      match_count: MATCH_COUNT,
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      user_id: user_id
    });

  if (error) {
    console.error('Error in getContextShort:', error);
    throw error;
  } else {
    // console.log('Data from getContextShort:', data);
    let result: Array<string> = [];
    
    for (const i in data) {
      result.push(data[i].content);
    }
    
    return result;
  }
}