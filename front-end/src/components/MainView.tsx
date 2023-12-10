import styles from "./MainView.module.css";
import { Options } from "./Options.jsx";
import { Input } from "./Input.jsx";
import { Responses } from "./Responses.jsx";
import { Conversation } from "./Conversation.jsx";

import { useState } from "react";

const MainView = () => {
  const [listen, setListen] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  return (
    <div className={styles.layout}>
      <div className={styles.grid_input}>
        <Input />
      </div>
      <div className={styles.grid_conversation}>
        <Conversation />
      </div>
      <div className={styles.grid_options}>
        <Options listen={listen} setListen={setListen} webSocket={webSocket} setWebSocket={setWebSocket}/>
      </div>
      <div className={styles.grid_responses}>
        <Responses />
      </div>
      <div className={styles.grid_responsesLabel}>Responses</div>
    </div>
  );
};

export default MainView;
