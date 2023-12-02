import styles from './MainView.module.css';
import Options from "./Options";

const MainView = () => {
    return (
            <div className={styles.layout}>
                <div className={styles.grid_input}>test</div>
                <div className={styles.grid_conversation}>test</div>
                <div className={styles.grid_options}>
                    <Options />
                </div>
                <div className={styles.grid_responses}>tset</div>
                <div className={styles.grid_responsesLabel}>Responses</div>
            </div>
    );
}

export default MainView;