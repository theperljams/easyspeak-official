import styles from "./Options.module.css";

export function Options({ listen, setListen, webSocket, setWebSocket}) {
	
  const doListen = async () => {
    if (listen) {
      // If already listening, stop listening
      webSocket?.close();
    } else {
      // If not listening, start listening
      const socket = new WebSocket(WEBSOCKET_URL + "/transcribe");

      socket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);
      };

      socket.onmessage = (event) => {
        // Handle incoming transcription results
        const transcriptionResult = event.data;
        console.log("Transcription Result:", transcriptionResult);
        setVoiceInput((prevInput) => prevInput + " " + transcriptionResult);
        socket.send("ACK"); // Send acknowledgement back to server
      };

      socket.onclose = (event) => {
        if (event.wasClean) {
          console.log("WebSocket closed cleanly:", event);
        } else {
          console.log("WebSocket connection closed unexpectedly:", event);
        }
      };

      setWebSocket(socket);
    }
  };

  const toggleListen = () => {
    setListen(!listen);
    doListen();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "left",
        width: "100%",
        height: "100%",
        gap: "10px",
      }}
    >
      <div
        style={{
          backgroundColor: "#007AFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "10px",
          fontSize: ".5em",
        }}
        onClick={toggleListen}
      >
        <span
          style={{
            userSelect: "none",
            minWidth: "250px",
            cursor: "pointer",
          }}
        >
          <img
            style={{
              filter: "color(white)",
            }}
            src={listen ? VolumeHigh : VolumeMute}
            width="30px"
            alt="volume high"
          />
          &nbsp;
          Listen: {listen ? "On" : "Off"}
        </span>
      </div>

      <div
        className={styles.vertically_centered_children_column}
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        Chat
      </div>
    </div>
  );
}
