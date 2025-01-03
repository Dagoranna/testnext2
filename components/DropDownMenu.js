'use client';

import { useState, useEffect } from 'react';
import styles from './DropDownMenu.module.css';
import MenuItemButton from './menu_items/MenuItemButton';
import MenuItemSwitcher from './menu_items/MenuItemSwitcher';

export default function DropDownMenu({id, title, itemsList = []}) {
  const [hasMouse, setHasMouse] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../utils/clientUtils').then(({ isPC }) => {
        setHasMouse(isPC());
      });
    }
  }, []);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const preparedList = itemsList.map(({ 
    itemName, 
    itemType,
    itemHandling, 
    startState=false 
    }, itemId) => itemType === 'button' ? (
      <MenuItemButton key={itemId} name={itemName} clickHandle={itemHandling} />
    ) : (
      <MenuItemSwitcher key={itemId} name={itemName} clickHandle={itemHandling} startState={startState} />
    ));

  return (
    <div 
      id={id}
      className={styles.dropDownMenu}
      onMouseEnter={hasMouse ? handleMouseEnter : null}
      onMouseLeave={hasMouse ? handleMouseLeave : null}
      onClick={!hasMouse ? toggleMenu : null}
    >
      <div className={styles.dropDownMenuTitle}>{ title }</div>
      {isOpen && <div className={styles.dropDownMenuList}> { preparedList } </div>}
    </div>
  );
}

//    className={styles.dropDownMenu}
//import styles from './DropDownMenu.module.css';