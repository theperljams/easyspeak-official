import React, { CSSProperties, FC } from 'react';
import styles from './CircleWithIcon.module.css';
interface CircleWithIconProps {
    icon: string; // Path to the SVG file
}

const CircleWithIcon: FC<CircleWithIconProps> = ({ icon }) => {
    const containerStyle = {
        width: '75px',
        height: '75px',
        borderRadius: '50%',
        backgroundColor: '#007AFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
    };

    const iconStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    };

    return (
        <div className={styles.hover_darken} style={containerStyle} onClick={clicked}>
            <img src={icon} alt="icon" style={iconStyle} />
        </div>
    );
};

export default CircleWithIcon;
