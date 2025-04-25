"use client";

import styles from "./MenuItem.module.css";
import { useState, useEffect } from "react";

type MyProps = {
  name: string;
  clickHandle: () => void;
  startState?: boolean;
};

export default function MenuItemSwitcher({
  name,
  clickHandle,
  startState = false,
}: MyProps) {
  const [switcherState, setSwitcherState] = useState(startState);

  function localClickHandle(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    setSwitcherState(!switcherState);
    clickHandle();
  }

  return (
    <div className={styles.itemSwitcher} onClick={(e) => localClickHandle(e)}>
      <div
        className={`${styles.switcherIndicator} ${switcherState ? styles.switcherOn : styles.switcherOff}`}
      ></div>
      <div>{name}</div>
    </div>
  );
}
