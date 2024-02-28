import { ChatBubble } from './ChatBubble';
import styles from '../styles/ChatWindow.module.css';
import type { Message } from './Interfaces';
import { useEffect } from 'react';

interface Props {
  messages: Message[];
  loading: Boolean;
  transcript: string;
  introMessages?: Message[];
}

// scroll to bottom on message submit

export function ChatWindow({ loading, messages, transcript, introMessages}: Props) {
  
  return (
    <div className={styles.chat}>
      {/* <div className={styles.titleBar}>{title}</div> */}
      <div className={styles.messagesList}>
        {introMessages && <>
          {introMessages.map((message, index) => (
              <ChatBubble key={index} role={message.role} content={message.content} />))}
        </>}
        {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />))}
        {loading && <ChatBubble role={'assistant'} content={transcript != '' ? transcript : '...' } />}
      </div>
      <div className='footer'/>
    </div>
  );
}
