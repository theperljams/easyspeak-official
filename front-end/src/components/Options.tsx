import styles from "./Options.module.css";
import VolumeHigh from "../assets/volume-high-solid.svg";
import VolumeMute from "../assets/volume-xmark-solid.svg";
import { addNewMessage } from "./Conversation";

const WEBSOCKET_URL = "ws://0.0.0.0:8000";

type Props = {
  listen: boolean;
  setListen: (val: boolean) => void;
  webSocket: WebSocket | null;
  setWebSocket: (val: WebSocket | null) => void;
  transcription: string;
  setTranscription: (val: string) => void;
};

export const Options: React.FC<Props> = ({
  listen,
  setListen,
  webSocket,
  setWebSocket,
  transcription,
  setTranscription,
}) => { 
	
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

      addNewMessage(transcription, "left");

      socket.onmessage = (event) => {
        // Handle incoming transcription results
        const transcriptionResult = event.data;
        console.log("Transcription Result:", transcriptionResult);
        setTranscription(transcription + " " + transcriptionResult);
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
