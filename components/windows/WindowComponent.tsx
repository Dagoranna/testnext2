"use client";

import styles from "./WindowComponent.module.css";
import WindowTitle from "./WindowTitle";
import Charsheet from "./charsheet/Charsheet";
import GameMap from "./gameMap/GameMap";
import Polydice from "./polydice/Polydice";
import GameTable from "./gameTable/GameTable";
import GlobalMap from "./globalMap/GlobalMap";

export default function WindowComponent({ title }) {
  const winComponents = {
    Charsheet: <Charsheet />,
    "Game Map": <GameMap />,
    Polydice: <Polydice />,
    "Game Table": <GameTable />,
    "Global Map": <GlobalMap />,
  };
  return (
    <div className={styles.winFrame}>
      <WindowTitle title={title} />
      {winComponents[title]}
    </div>
  );
}
