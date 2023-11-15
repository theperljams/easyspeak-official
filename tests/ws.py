import asyncio
import random
from fastapi import FastAPI, WebSocket

app = FastAPI()

async def generate_random_words(websocket: WebSocket):
    while True:
        await asyncio.sleep(1)  # Wait for one second
        random_word = ''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(5))
        print("Random word: ", random_word)
        await websocket.send_text(random_word)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await generate_random_words(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
