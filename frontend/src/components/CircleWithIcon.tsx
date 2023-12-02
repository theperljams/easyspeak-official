import React, {CSSProperties, FC} from 'react';

interface CircleWithIconProps {
    icon: string; // Path to the SVG file
}

const CircleWithIcon: FC<CircleWithIconProps> = ({ icon }) => {
    const containerStyle = {
        width: '75px',
        height: '75px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#3498db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const iconContainerStyle = {
        width: '80%',
        height: '80%',
        overflow: 'hidden',
    };

    const iconStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
    };

    return (
        <div style={containerStyle}>
            <div style={iconContainerStyle}>
                <img src={icon} alt="icon" style={iconStyle} />
            </div>
        </div>
    );
};

export default CircleWithIcon;
