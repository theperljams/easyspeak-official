import React, { useEffect, useRef, useState } from 'react';
import { ChatBubble } from './ChatBubble';
import styles from './Chat.module.css';

export interface Message {
  message: string;
  side: 'left' | 'right';
}

interface Props {
  messages: Message[];
  transcript: string;
}

export function Training({ messages, transcript }: Props) {
  const [trainingStarted, setTrainingStarted] = useState(false);

  return (
    <div className={styles.chat}>
      <div className={styles.titleBar}>Chat</div>
      <div className={styles.messagesList}>
        {!trainingStarted && 
        <button className={styles.button} type="button" onClick={() => {setTrainingStarted((prev) => !prev)}}/>}
        {messages.map((message, index) => (
          <ChatBubble key={index} side={message.side} message={message.message} />
        ))}
      </div>
    </div>
  );
}
