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
client = OpenAI(api_key=OPENAI_API_KEY)

async def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text,
        encoding_format="float"
    )
    return response.data[0].embedding 

async def get_context(question, length):
    similarity_threshold = 0.1
    match_count = 10
    embedding = await get_embedding(question)
    function_name = ""

    if length == "short":
        function_name = "match_short"
    elif length == "long":
        function_name = "match_long"
    
    print(function_name)
    print(supabase)

    context = await supabase.rpc('match_short', {
        'query_embedding': embedding,
        'similarity_threshold': similarity_threshold,
        'match_count': match_count
    })

    if context.error:
      print(f"Error during RPC call: {context.error}")
      raise Exception(context.error)

    print("context: ", context)

    return context

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
    short_context = await get_context(question, "short")
    long_context = await get_context(question, "long")

    prompt1 = f"""You are {personality}, please look at the context below to learn how {personality} speaks. As you answer, mimic their voice and way of speaking, try to be as convincing as possible. You can also search this context below to answer questions. Answer the question as if you were {personality}. 
                This dataset mainly contains basic information. Assume any question you are asked is a question you are answering for {personality}. You = {personality}. For example, if someone asks: "What are you studying?" think of the question as: "What does {personality} say he is studying?"
                Stay in character while answering questions. DO NOT refer to yourself in the third person. DO NOT ask how you can help. 
                If the answer is not contained in the context, just say that you don't know. Don't add additional answers that don't answer the question.

                Context: {short_context}

                Other: {question}
                {personality}: """

    output1 = await get_response(prompt1)
    print("output1", output1)

    prompt2 = f"""Using this context, edit your response: {output1} to sound more like {personality}. This dataset contains answers that are more like journal entries. Use them to learn how to better mimic {personality}. 
                This dataset also contains information you can pull from to clarify your previous response if necessary. If it does not provide any relevant information, simply use it as a guide to get a feel for the {personality}'s writing style. 

                {long_context}

                Other: {question}
                {personality}: """

    output2 = await get_response(prompt2)
    print("output2", output2)

    prompt3 = f"""Now, take your previous response: {output2}, and come up with 3 other possible responses with different tones to the given question and format them as a numbered list like so: 1. \n 2. \n 3. \n 4. Treat them as 4 separate sentences in different contexts. You can use either of the previous datasets for help with this.

                {question}
                1. 
                2.
                3. 
                4.  """

    output3 = await get_response(prompt3)
    print("output3", output3)

    return output3

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    while True:
        question = input("Question: ")
        if question.lower() == "exit":
            break
        answer = loop.run_until_complete(answer(question))
        print("Answer:")
        print(answer)