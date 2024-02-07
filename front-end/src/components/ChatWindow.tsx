import React, { useEffect, useRef, useState } from 'react';
import { ChatBubble } from './ChatBubble';
import styles from './ChatWindow.module.css';
import type { Message } from './Interfaces';

interface Props {
  messages: Message[];
  loading: Boolean;
  transcript: string;
  title : string;
}

// scroll to bottom on message submit

export function ChatWindow({ loading, messages, transcript, title }: Props) {
  return (
    <div className={styles.chat}>
      <div className={styles.titleBar}>{title}</div>
      <div className={styles.messagesList}>
        {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />
        ))}
        {loading && <ChatBubble role={'assistant'} content={transcript} />}
      </div>
      <div className='footer'/>
    </div>
  );
}
