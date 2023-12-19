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
}

export function InputBar({ inputText, speak }: Props) {
    function openKeyboard() {
        alert("You should probably change this!");
    }

    
    return (
        <div className={styles.inputBar}>
            <div className={styles.button} onClick={openKeyboard}>
                <img src={pencil} alt="icon" className={styles.buttonIcon} />
            </div>
            <input
                className={styles.textBox}
                type="text"
                value={inputText} // Display the input text here
                placeholder="Type anything here..."
            />
            <div className={styles.button} onClick={speak}>
                <img src={paperAirplane} alt="icon" className={styles.buttonIcon} />
            </div>
        </div>
    );
}
