import dotenv from 'dotenv';
import fetch from 'node-fetch';


export async function fetchRetrievals(apiKey: string, content: string, user_id: string, top_k: number, max_chunks: number, rerank: boolean) {
    try {
      const response = await fetch("https://api.ragie.ai/retrievals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          "query": content,
          "top_k": top_k,
          "filter": {
            "user": user_id,
          },
          "rerank": rerank,
          "max_chunks_per_document": max_chunks
        }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching retrievals:", error);
      throw error;
    }
}
