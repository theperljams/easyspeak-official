import os
import dotenv
from openai import OpenAI
import asyncio

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
    prompt = f"""You are an assistant drafting texts for {USER_NAME}. Your goal is to sound as much like them as possible. Follow these steps to learn how to do this.

                Step 1: Look at the context below to learn how {USER_NAME} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search this context below to answer questions. Answer the question as if you were sending a text from {USER_NAME}'s phone. 
                This dataset mainly contains basic information. You = {USER_NAME}. For example, if someone asks: "What are you studying?" think of the question as: "What does {USER_NAME} say they are studying?" 
                If the answer is not contained in the context, just say that you don't know. Don't add additional answers that don't answer the question.

                Context: {context_short}

                Other: {content}
                {USER_NAME}:
                
                Step 2: Now, look at this context to learn {USER_NAME}'s writing style. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic {USER_NAME}. 
                This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, only use it for style. Edit your previous response to sound more like {USER_NAME}.

                {context_long}

                Other: {content}
                {USER_NAME}:
                
                Step 3: Now, take your previous response and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this."""

    responses = await get_chat_completions(prompt)
    
    print("RESPONSES: ", responses, "\n\n")
    return responses

async def get_chat_completions(prompt):
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