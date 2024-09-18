import fs from "fs";
import { readFile } from "node:fs/promises";
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.RAGIE_API_KEY;

export async function fetchRetrievals(apiKey: string, content: string) {
    try {
      const response = await fetch("https://api.ragie.ai/retrievals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          query: content,
          filter: {
            scope: "user",
          },
        }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching retrievals:", error);
      throw error;
    }
  }
  
