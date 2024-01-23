import React, { useEffect, useRef } from 'react';
import { ChatBubble } from './ChatBubble';
import styles from './Chat.module.css';

export interface Message {
  message: string;
  side: 'left' | 'right';
}

interface Props {
  messages: Message[];
  loading: Boolean;
  transcript: string;
}

export function Chat({ loading, messages, transcript }: Props) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chat}>
      <div className={styles.titleBar}>Chat</div>
      <div className={styles.messagesList} ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <ChatBubble key={index} side={message.side} message={message.message} />
        ))}
        {loading && <ChatBubble side={'left'} message={transcript} />}
      </div>
    </div>
  );
}
