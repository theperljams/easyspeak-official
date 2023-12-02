import styles from './MainView.module.css';
import Options from "./Options";
import Input from "./Input";
import Responses from "./Responses";
import Conversation from "./Conversation";

const MainView = () => {
    return (
            <div className={styles.layout}>
                <div className={styles.grid_input}><Input/></div>
                <div className={styles.grid_conversation}>
                    <Conversation />
                </div>
                <div className={styles.grid_options}>
                    <Options />
                </div>
                <div className={styles.grid_responses}>
                    <Responses />
                </div>
                <div className={styles.grid_responsesLabel}>Responses</div>
            </div>
    );
}

export default MainView;