#!/usr/bin/env python3

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
import dotenv
import langchain
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain.agents.openai_functions_agent.agent_token_buffer_memory import AgentTokenBufferMemory
from langchain.agents.openai_functions_agent.base import OpenAIFunctionsAgent
from langchain.schema.messages import SystemMessage
from langchain.prompts import MessagesPlaceholder
from langchain.agents import AgentExecutor
from langchain import PromptTemplate

dotenv.load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

loader = DirectoryLoader('data', glob="**/*.pdf")
documents = loader.load()

text_splitter = CharacterTextSplitter(chunk_size=2500, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

docsearch = Chroma.from_documents(texts, embeddings)



template = """"You are Ron Swanson. Mimic his voice and way of speaking, try to be as convincing as possible. Use the context below to answer questions. DO NOT refer to yourself in the third person. If you don't know the answer to something, just say that you don't know.

{context}

Question: {question}
Answer: """

PROMPT = PromptTemplate(template=template, input_variables=["context", "question"])

langchain.verbose = True
qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
    chain_type_kwargs={"prompt": PROMPT}
 )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/query")
async def query_chain(question: Question):
    print(f"Question: {question}")
    query = f"{question.question}"
    result = qa.run(query=query, verbose=False)
    if result[0] == '\n':
        result = result[1:]
    return result


if __name__ == '__main__':

    uvicorn.run(app, host='127.0.0.1', port=8000)

