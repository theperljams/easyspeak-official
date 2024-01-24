import React, { useEffect, useRef, useState } from 'react';
import { ChatBubble } from './ChatBubble';
import styles from './Training.module.css';

export interface Message {
  message: string;
  side: 'left' | 'right';
}

interface Props {
  messages: Message[];
  session: boolean;
  setSessionStarted: () => void;
  transcript: string;
}

export function Training({ messages, session, setSessionStarted, transcript }: Props) {
  return (
    <div className={styles.chat}>
      <div className={styles.titleBar}>Training Mode</div>
      <div className={styles.messagesList}>
        {!session && 
        <button className={styles.button} type="button" onClick={setSessionStarted}/>}
        {messages.map((message, index) => (
          <ChatBubble key={index} side={message.side} message={message.message} />
        ))}
      </div>
    </div>
  );
}
