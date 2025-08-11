"use client";

import styles from "./MenuItem.module.css";

type MyProps = {
  name: string;
  clickHandle: (e: React.MouseEvent) => void;
};

export default function MenuItemButton({ name, clickHandle }: MyProps) {
  return (
    <div className={styles.itemButton} onClick={(e) => clickHandle(e)}>
      {name}
    </div>
  );
}
