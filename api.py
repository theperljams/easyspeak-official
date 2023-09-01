#!/usr/bin/env python3

from fastapi import FastAPI
from pydantic import BaseModel


class Query(BaseModel):
    question: str

app = FastAPI()



@app.post("/query/")
async def query_chain(query: Query):
    return {"answer": f"I know you are but what am I {query.question}"}