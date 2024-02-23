import React from 'react';
import { Link } from 'react-router-dom';

import styles from '../styles/MenuButton.module.css';

interface Props {
  image: string;
  link: string;
  title: string;
}

export function MenuButton({image, link, title}: Props) {
  return (
    <div className={styles.mainView}>
      <Link className={styles.link} to={link}>
        <img src={image}/>
        <div className={styles.title}>{title}</div>
      </Link>
    </div>
  );
}