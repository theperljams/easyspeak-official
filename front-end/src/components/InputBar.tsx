// InputBar.tsx
import { useState, useRef, type FormEvent } from 'react';
import styles from '../styles/InputBar.module.css';
import send from '../assets/send.svg';

interface Props {
  inputText: string;
  setInput: (newText: string) => void;
  handleSubmitInput: () => void;
  audioURL: string | null;
  loading?: boolean;
  setIsListening: (isListening: boolean) => void;
  setDisplayResponses: (display: boolean) => void;
}

export function InputBar({
  inputText,
  setInput,
  handleSubmitInput,
  audioURL,
  setIsListening,
  loading = false,
  setDisplayResponses,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitInput();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitInput();
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setDisplayResponses(false);
    if (textareaRef.current) {
      // Reset the height to auto to calculate the new height correctly
      textareaRef.current.style.height = 'auto';
      // Set the height to the scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleAudioPlay = () => {
    console.log('Audio started');
    setIsListening(false);
  };

  const handleAudioEnd = () => {
    console.log('Audio ended');
    setIsListening(true);
  };

  return (
    <div className={styles.container}>
      <form className={styles.inputBar} onSubmit={onFormSubmit}>
        <div className={styles.textContainer}>
          <textarea
            className={styles.textBox}
            disabled={loading}
            value={inputText}
            onKeyDown={onTextareaKeyDown}
            onChange={handleTextareaChange}
            ref={textareaRef}
            rows={1}
            style={{ overflow: 'hidden', resize: 'none' }}
            placeholder="Type your message..."
          />
          <button className={styles.button} type="submit">
            <img src={send} alt="Send" className={styles.buttonIcon} />
          </button>
        </div>
        {audioURL && (
          <audio
            autoPlay
            key={audioURL}
            onPlay={handleAudioPlay}
            onEnded={handleAudioEnd}
          >
            <source src={audioURL} type="audio/mpeg" />
          </audio>
        )}
      </form>
    </div>
  );
}
