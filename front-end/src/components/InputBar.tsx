import styles from "./InputBar.module.css";
import pencil from "../assets/pencil.svg";
import paperAirplane from "../assets/paper-airplane.svg";

interface Message {
    message: string;
    side: "left" | "right";
}

interface Props {
    inputText: string;
    speak: () => void;
    audioURL: string | null;
}

export function InputBar({ inputText, speak, audioURL }: Props) {
    function openKeyboard() {
        alert("You should probably change this!");
    }

    function playAudio() {
        if (audioURL) {
            const audioElement = document.querySelector("audio");
			if (audioElement) {
				audioElement.play();
			}
            
        }
    }

    return (
        <div className={styles.inputBar}>
            <div className={styles.button} onClick={openKeyboard}>
                <img src={pencil} alt="icon" className={styles.buttonIcon} />
            </div>
            <input
                className={styles.textBox}
                type="text"
                value={inputText}
                placeholder="Type anything here..."
            />
            {audioURL && ( // Conditionally render audio player
                <audio autoPlay key={audioURL}>
                    <source src={audioURL} type="audio/mpeg" />
                </audio>
            )}
            <div className={styles.button} onClick={speak}>
                <img src={paperAirplane} alt="icon" className={styles.buttonIcon} />
            </div>
        </div>
    );
}
