import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const SIMILARITY_THRESHOLD = 0.1;
const MATCH_COUNT = 10;


export const insertQAPair = async (user_id: string, content: string, embedding: number[], table_name: string) => {
  console.log(table_name);
  try {
    await supabase.from(table_name).insert({
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

export const getContextShort = async (embedding: number[], user_id: string) => {
  try {
    const { data, error } = await supabase.rpc('match_short', {
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

