import openai
from supabase_py import create_client, Client
import os
import dotenv
from openai import OpenAI
import asyncio

dotenv.load_dotenv()

personality = "Pearl"
OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings"
OPENAI_API_KEY = "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" 
SUPA_TABLE = "long"
SUPABASE_URL = "https://pzwlpekxngevlesykvfx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6d2xwZWt4bmdldmxlc3lrdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYyMTgyNDksImV4cCI6MjAyMTc5NDI0OX0.ypVAYmCz4NCthZyntGAPMN5W6zSJOtiJRx8O7XyCENU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text,
        encoding_format="float"
    )
    return response.data[0].embedding

async def post_request_to_supabase_short(question):
    import requests
    similarity_threshold = 0.1
    match_count = 10
    embedding = await get_embedding(question)

    # Define the URL and the payload
    url = 'https://pzwlpekxngevlesykvfx.supabase.co/rest/v1/rpc/match_short'
    payload = {
        "match_count": match_count,
        "query_embedding": embedding,
        "similarity_threshold": similarity_threshold
    }

    # Define the headers
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # Make the POST request
    response = requests.post(url, json=payload, headers=headers)

    # Return the response
    if response.ok:
        return response.json()
    else:
        return response.status_code, response.text
    
async def post_request_to_supabase_long(question):
    import requests
    similarity_threshold = 0.1
    match_count = 10
    embedding = await get_embedding(question)

    # Define the URL and the payload
    url = 'https://pzwlpekxngevlesykvfx.supabase.co/rest/v1/rpc/match_long'
    payload = {
        "match_count": match_count,
        "query_embedding": embedding,
        "similarity_threshold": similarity_threshold
    }

    # Define the headers
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # Make the POST request
    response = requests.post(url, json=payload, headers=headers)

    # Return the response
    if response.ok:
        return response.json()
    else:
        return response.status_code, response.text

async def get_response(prompt):
    stream = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    responseList = []
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            responseList.append(chunk.choices[0].delta.content)

    result = "".join(responseList)
    return result

async def answer(question):
    short_context = await post_request_to_supabase_short(question)
    long_context = await post_request_to_supabase_long(question)

    prompt = f"""You are an assistant drafting texts for {personality}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

                Step 1: Look at the context below to learn how {personality} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search this context below to answer questions. Answer the question as if you were sending a text from {personality}'s phone. 
                This dataset mainly contains basic information. You = {personality}. For example, if someone asks: "What are you studying?" think of the question as: "What does {personality} say they are studying?" 
                If the answer is not contained in the context, just say that you don't know. Don't add additional answers that don't answer the question.

                Context: {short_context}

                Other: {question}
                {personality}:  
                
                Step 2: Now, look at this context to learn {personality}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic {personality}. 
                This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like {personality}.

                {long_context}

                Other: {question}
                {personality}:
                
                Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this."""
    
    print("PROMPT: ", prompt, "\n\n")
    
    response = await get_response(prompt)
    print("RESPONSE: ", response, "\n\n")
    return response

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    while True:
        question = input("Question: ")
        if question.lower() == "exit":
            break
        result = loop.run_until_complete(answer(question))
        print("Answer:")
        print(result)