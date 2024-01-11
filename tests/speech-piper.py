


@cool_app.websocket("/speak")
async def handle_audio(websocket: WebSocket):
    await websocket.accept()

    # Receive the initial message containing the question text
    message = await websocket.receive_text()  # Use receive_text() for text messages
    question_data = json.loads(message)  # Deserialize JSON if applicable
    question_text = question_data.get("question")  # Extract the question from the parsed data
    print("[WEB]:\t Received question: ", question_text)

    # Put the question text in the queue
    cool_app.generated_queue.put(question_text)

    try:
        while True:
            audio_data = b"" 

            while not cool_app.speech_queue.empty():
                audio_part = cool_app.speech_queue.get()
                audio_data += audio_part
                print("[WEB]:\t Got audio")

            if audio_data:
                print("[WEB]:\t Sending audio")
                await websocket.send_bytes(audio_data)
                await websocket.receive()

    except WebSocketDisconnect:
        print(f"[WEB]:\t Closed Socket")
        await websocket.close()
    