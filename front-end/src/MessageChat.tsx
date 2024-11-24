// MessageChat.tsx

import React, { useState, useEffect, useRef } from "react";
import { Responses } from "./components/Responses";
import { ThreeDot } from "react-loading-indicators";
import styles from "./styles/Chat.module.css";
import { RefreshButton } from "./components/RefreshButton";
import { InputBar } from "./components/InputBar";
import io from "socket.io-client";

interface MessageSet {
  message: string;
  responses: string[];
  timestamp: number;
}

export function MessageChat() {
  const [textInput, setTextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [status, setStatus] = useState("");

  const [messageQueue, setMessageQueue] = useState<MessageSet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // useRef to store the socket instance
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Socket.IO client for Front End namespace only once
    socketRef.current = io("http://localhost:3000/frontend"); // Connect to '/frontend' namespace

    // Listen for 'newMessage' event from Back End
    socketRef.current.on("newMessage", (data: any) => {
      const { message, timestamp, responses } = data;
      console.log("Received newMessage:", data);

      setMessageQueue((prevQueue) => {
        const newQueue = [
          ...prevQueue,
          {
            message: message,
            responses: responses,
            timestamp: timestamp,
          },
        ];

        // Sort the queue by timestamp
        newQueue.sort((a, b) => a.timestamp - b.timestamp);

        // Find the index of the new message
        const index = newQueue.findIndex((item) => item.timestamp === timestamp);

        // Update the currentIndex
        setCurrentIndex(index);

        return newQueue;
      });

      setStatus("New message received.");
    });

    // Listen for 'chatChanged' event from Back End
    socketRef.current.on("chatChanged", (data: any) => {
      const { new_chat_id } = data;
      console.log("Chat changed to:", new_chat_id);

      // Clear the message queue and reset the current index
      setMessageQueue([]);
      setCurrentIndex(0);

      setStatus(`Switched to a new chat: ${new_chat_id}`);
    });

    // Listen for acknowledgments and errors
    socketRef.current.on("ack", (data: any) => {
      setStatus(data.message);
      console.log("Acknowledgment from server:", data);
    });

    socketRef.current.on("responseSubmitted", (data: any) => {
      setStatus(data.message);
      console.log("Response submitted:", data);
    });

    socketRef.current.on("error", (data: any) => {
      setStatus(`Error: ${data.error}`);
      console.error("Socket.IO error:", data);
    });

    // Handle disconnection
    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from Back End");
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const currentMessageSet = messageQueue[currentIndex];
  const currentResponses = currentMessageSet ? currentMessageSet.responses : [];
  const currentMessage = currentMessageSet ? currentMessageSet.message : "";
  const currentTimestamp = currentMessageSet ? currentMessageSet.timestamp : 0;

  const handleResponseSelection = () => {
    console.log("Selected response:", textInput);
    if (textInput && currentMessageSet) {
      socketRef.current.emit("submitSelectedResponse", {
        selected_response: textInput,
        currMessage: currentMessage,
        messageTimestamp: currentTimestamp,
      });
      setStatus("Selected response submitted.");

      // Optionally, clear the input text
      setTextInput("");

      // Remove the message from the queue
      setMessageQueue((prevQueue) => {
        const newQueue = prevQueue.filter(
          (item) => item.timestamp !== currentTimestamp
        );

        // Adjust currentIndex if necessary
        let newIndex = currentIndex;
        if (newIndex >= newQueue.length) {
          newIndex = newQueue.length - 1;
        }
        setCurrentIndex(newIndex >= 0 ? newIndex : 0);

        return newQueue;
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < messageQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.loadingIndicator}>
          {isGenerating ? (
            <ThreeDot color="#007BFF" size="medium" text="" textColor="" />
          ) : (
            <RefreshButton
              handleRefresh={() => {
                /* Optional: Implement refresh logic */
              }}
            />
          )}
        </div>

        {messageQueue.length > 0 && currentMessageSet ? (
          <>
            <div className={styles.navigation}>
              <button onClick={handlePrev} disabled={currentIndex === 0}>
                &lt; Prev
              </button>
              <span>
                {currentIndex + 1} / {messageQueue.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === messageQueue.length - 1}
              >
                Next &gt;
              </button>
            </div>

            <div className={styles.messageView}>
              <p>
                <strong>Message:</strong> {currentMessage}
              </p>
            </div>

            <div className={styles.responseView}>
              <Responses
                responses={currentResponses}
                setInputText={setTextInput}
                isGenerating={isGenerating}
              />
            </div>
          </>
        ) : (
          <div className={styles.noMessages}>
            <p>No messages in the queue.</p>
          </div>
        )}

        {/* InputBar component for typing and submitting responses */}
        <InputBar
          inputText={textInput}
          setInput={setTextInput}
          handleSubmitInput={handleResponseSelection}
          audioURL={null}
          setIsListening={setIsListening}
          setDisplayResponses={() => {}}
        />

        {/* Display status messages */}
        <div className={styles.status}>
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}
