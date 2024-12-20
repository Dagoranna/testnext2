'use client';

import { useState, useEffect } from 'react';
import styles from './DropDownMenu.module.css';

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

  const preparedList = itemsList.map(({ itemname, itemHandling }, id) => (
    <li key={ id } onClick={itemHandling} className={styles.dropDownMenuItem}>
      { itemname }
    </li>
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
      {isOpen && <ul className={styles.dropDownMenuList}> { preparedList } </ul>}
    </div>
  );
}

//    className={styles.dropDownMenu}
//import styles from './DropDownMenu.module.css';