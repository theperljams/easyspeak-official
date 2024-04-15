import { useState, type FormEvent } from 'react';

import styles from '../styles/InputBar.module.css';
import send from '../assets/send.svg';

interface Props {
    inputText: string;
    setInput: (newText: string) => void;
    handleSubmitInput: () => void;
    audioURL: string | null;
    loading?: boolean;
    setIsListening: (isListening: boolean) => void;
}

export function InputBar({ inputText, setInput, handleSubmitInput, audioURL, setIsListening, loading }: Props) {

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmitInput();
        setInput('');
    };

    const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitInput();
            setInput('');
        }
    };

    const handleAudioPlay = () => {
        console.log("Audio started");
        setIsListening(false);
    };

    const handleAudioEnd = () => {
        console.log("Audio ended");
        setIsListening(true);
    };

    return (
        <div className={styles.container}>
            <form className={styles.inputBar} onSubmit={onFormSubmit}>
                <div className={styles.textContainer}>
                    <textarea 
                        className={styles.textBox}
                        disabled={loading} 
                        name="input" 
                        id="" 
                        value={inputText}
                        onKeyDown={onTextareaKeyDown}
                        onChange={e => setInput(e.target.value)}
                    />
                    {
                        audioURL != null && (
                            <audio 
                                autoPlay 
                                key={audioURL} 
                                onPlay={handleAudioPlay} 
                                onEnded={handleAudioEnd}>
                                <source src={audioURL} type="audio/mpeg"/>
                            </audio>
                        )
                    }
                    <button className={styles.button} type="submit">
                        <img src={send} alt="icon" className={styles.buttonIcon} />
                    </button>
                </div>
            </form>
        </div>
    );
}
