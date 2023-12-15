
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect

cool_app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

cool_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str


@cool_app.post("/query")
async def query_chain(question: Question):
    print(f"Question: {question}")
    
    # Modify this part to return hardcoded text
    return {"message": "This is a hardcoded response for the query endpoint." + question.question}

@cool_app.websocket("/transcribe")
async def transcribe(websocket: WebSocket):
    await websocket.accept()
    
    # Modify this part to send hardcoded text
    try:
        while True:
            text = "This is a hardcoded message."
            print(f"[WEB]:\t Sending: {text}")
            await websocket.send_text(text)
            await websocket.receive()
    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()

@cool_app.post("/speak") 
async def handle_audio(response: Question):
    # Modify this part to return hardcoded text
    return {"message": "This is a hardcoded response for the speak endpoint." + response.question }

# ... (other existing routes)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(cool_app, host="127.0.0.1", port=8000)
