'use client';

import styles from './WindowComponent.module.css';
import WindowTitle from './WindowTitle';
import Charsheet from './charsheet/Charsheet';
import GameMap from './gameMap/GameMap';
import Polydice from './polydice/Polydice';

export default function WindowComponent({ title }) {
  const winComponents = {
    'Charsheet': <Charsheet />,
    'Game Map': <GameMap />,
    'Polydice': <Polydice />,
  }
  return (
    <div className={ styles.winFrame }>
      <WindowTitle title={ title } />
      { winComponents[title] }
    </div>
  );
}

