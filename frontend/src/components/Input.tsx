import Pencil from '../assets/pencil-solid.svg';
import Send from '../assets/paper-plane-regular.svg';
import CircleWithIcon from "./CircleWithIcon";
const Input = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'start',
            width: '100%',
            height: '75%',
            gap: '10px',
            padding: '10px',

        }}>
            <CircleWithIcon icon={Pencil} />
            <input type={'text'} style={{
                fontSize: '.5em',
                borderRadius: '15px',
                paddingLeft: '20px',
                paddingRight: '20px',
                height: '75%',
                width: '100%',
            }}/>
            <CircleWithIcon icon={Send} />
        </div>
    )
}

export default Input;