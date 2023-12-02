import VolumeHigh from '../assets/volume-high-solid.svg';
import VolumeMute from '../assets/volume-xmark-solid.svg';
import styles from './Options.module.css';
import {useState} from "react";

const Options = () => {
    const [listen, setListen] = useState(false);

    const toggleListen = () => {
        setListen(!listen);
    }

    return (
        <div style={
            {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'left',
                width: '100%',
                height: '100%',
                gap: '10px',
            }
        }>
            <div /*className={`${styles.listen_toggle}`}*/
                 style={{
                     backgroundColor: '#007AFF',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     padding: '10px',
                     fontSize: '.5em',
                 }}
                 onClick={toggleListen}>
                <span className={`${styles.vertically_centered_children_row}`}
                      style={{
                          userSelect: 'none',
                          minWidth: '250px',
                          cursor: 'pointer',

                      }}>
                    <img style={{
                        filter: 'color(white)',
                    }}
                         src={listen ? VolumeHigh : VolumeMute}
                         width="30px"
                         alt="volume high"/>
                    &nbsp;
                    Listen: {listen ? 'On' : 'Off'}
                </span>
            </div>

            <div className={styles.vertically_centered_children_column}
            style={{
                textAlign: 'center',
                width: '100%',
            }}>
                Chat
            </div>

        </div>
    );
};

export default Options;