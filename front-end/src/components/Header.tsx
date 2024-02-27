import React from 'react';
import styles from '../styles/Header.module.css';
import { MenuButton } from './MenuButton';

import HomeIcon from '../assets/home-2.svg';
import SettingsIcon from '../assets/setting-2.svg';

interface Props {
	title: string;
}

export function Header({ title }: Props) {
	return (
		<div className={styles.mainView}>
			<MenuButton image={HomeIcon} link="/" title="home" />
			<div className={styles.title}>
				{title}
			</div>
			<MenuButton image={SettingsIcon} link="/settings" title="settings" />
		</div>
	);
}

export default Header;
