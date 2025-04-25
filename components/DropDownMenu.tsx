"use client";

import { useState, useEffect } from "react";
import styles from "./DropDownMenu.module.css";
import MenuItemButton from "./menu_items/MenuItemButton";
import MenuItemSwitcher from "./menu_items/MenuItemSwitcher";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store/store";

export type MenuItemProps = {
  itemName: string;
  itemType: string;
  itemHandling: (
    e?: React.MouseEvent | React.PointerEvent
  ) => Promise<void> | void;
  startState?: boolean;
};

type MyProps = {
  id: string;
  title: string;
  itemsList: MenuItemProps[];
  addStyle?: string;
};

export default function DropDownMenu({
  id,
  title,
  itemsList = [],
  addStyle = "",
}: MyProps) {
  const loginState = useSelector((state: RootState) => state.main.loginState);
  const [hasMouse, setHasMouse] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("../utils/clientUtils").then(({ isPC }) => {
        setHasMouse(isPC());
      });
    }
  }, []);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const preparedList = itemsList.map(
    ({ itemName, itemType, itemHandling, startState = false }, itemId) => {
      let currentItem =
        itemType === "button" ? (
          <MenuItemButton
            key={itemId}
            name={itemName}
            clickHandle={itemHandling}
          />
        ) : (
          <MenuItemSwitcher
            key={itemId}
            name={itemName}
            clickHandle={itemHandling}
            startState={startState}
          />
        );
      if (loginState || itemName === "Game Map" || itemName === "Polydice")
        return currentItem;
    }
  );

  return (
    <div
      id={id}
      className={styles.dropDownMenu}
      onMouseEnter={hasMouse ? handleMouseEnter : undefined}
      onMouseLeave={hasMouse ? handleMouseLeave : undefined}
      onClick={!hasMouse ? toggleMenu : undefined}
    >
      <div className={`${styles.dropDownMenuTitle} ${styles[addStyle]}`}>
        {title}
      </div>
      {isOpen && (
        <div className={styles.dropDownMenuList}> {preparedList} </div>
      )}
    </div>
  );
}
