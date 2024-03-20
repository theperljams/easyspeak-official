import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error('Supabase URL and API Key must be set in environment variables.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const SIMILARITY_THRESHOLD = -0.5;
const MATCH_COUNT = 50;

export const getPearlContextLong = async (embedding: number[]) => {
    try {
      const { data, error } = await supabase.rpc('match_pearl_long', {
        match_count: MATCH_COUNT,
        query_embedding: embedding,
        similarity_threshold: SIMILARITY_THRESHOLD
      });
      
      let result: Array<string> = [];
      for (const i in data) result.push(data[i].content);
      return result;
      
    } catch (error) {
      throw error;
    }
  }

  export const getPearlContextShort = async (embedding: number[]) => {
    try {
      const { data, error } = await supabase.rpc('match_pearl_short', {
        match_count: MATCH_COUNT,
        query_embedding: embedding,
        similarity_threshold: SIMILARITY_THRESHOLD
      });
      
      let result: Array<string> = [];
      for (const i in data) result.push(data[i].content);
      return result;
      
    } catch (error) {
      throw error;
    }
  }

  export const getPearlAllLong = async () => {
    try {
      const { data: longData, error: longError } = await supabase
        .from('pearl_long_form')
        .select('*');
  
      if (longError) {
        throw new Error('Error fetching data from Supabase');
      }
  
      let result: Array<string> = [];
      
      for (const j in longData) result.push(longData[j].content);
  
      return result;
    } catch (error) {
      throw error;
    }
  }

  export const getPearlAllShort = async () => {
    try {

      const { data: shortData, error: shortError } = await supabase
        .from('pearl_short_form')
        .select('*');

      if (shortError) {
        throw new Error('Error fetching data from Supabase');
      }

      let result: Array<string> = [];
      for (const i in shortData) result.push(shortData[i].content);

      return result;
    } catch (error) {
      throw error;
    }
  }

  export const getPearlContextAll = async () => {
    try {
      const { data: longData, error: longError } = await supabase
        .from('pearl_long_form')
        .select('*');
  
      const { data: shortData, error: shortError } = await supabase
        .from('pearl_short_form')
        .select('*');
  
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