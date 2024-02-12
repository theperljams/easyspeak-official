import os
import dotenv
from openai import OpenAI

dotenv.load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings'
client = OpenAI(api_key=OPENAI_API_KEY)

USER_NAME = 'Pearl'
      
async def get_embedding(content):
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=content,
        encoding_format="float"
    )
    return response.data[0].embedding

async def generate_responses(content, context_short, context_long):
    prompt = f"""You are an assistant drafting texts for {USER_NAME}. Your goal is to sound as much like them as possible. 
    Follow these steps to learn how to do this. Here is some general information about her: {context_short}, 
    here are some question and answer samples from her for generating responses in her likeness: {context_long}.
    Give me an example of how user would respond to this: {content}"""

    responses = await get_chat_completions(prompt, content.messages)
    
    print("RESPONSES: ", responses, "\n\n")
    return responses

async def get_chat_completions(prompt, messages):
    stream = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[{"role": "system", "content": prompt}] + messages,
        stream=True,
    )
    responseList = []
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            responseList.append(chunk.choices[0].delta.content)

    result = "".join(responseList)
    return result