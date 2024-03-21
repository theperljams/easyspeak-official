import { type FormEvent } from 'react';

import styles from '../styles/InputBar.module.css';
import sendIcon from '../assets/send.svg';

interface Props {
    inputText: string;
    setInput: (newText: string) => void;
    handleSubmitInput: () => void;
    generate: () => void;
    loading?: boolean;
}

export function TestInputBar({ inputText, setInput, handleSubmitInput, generate, loading }: Props) {
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
                    <div className={styles.buttonsContainer}>
                        <button className={styles.button} type="button" onClick={generate}>
                            Generate
                        </button>
                        <button className={styles.button} type="submit">
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
