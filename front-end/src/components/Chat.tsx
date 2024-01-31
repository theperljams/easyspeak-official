import React, { useEffect, useRef, useState } from 'react';
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

// scroll to bottom on message submit

export function Chat({ loading, messages, transcript }: Props) {
  return (
    <div className={styles.chat}>
      <div className={styles.titleBar}>Chat</div>
      <div className={styles.messagesList}>
        {messages.map((message, index) => (
          <ChatBubble key={index} side={message.side} message={message.message} />
        ))}
        {loading && <ChatBubble side={'left'} message={transcript} />}
      </div>
      <div className='footer'/>
    </div>
  );
}
