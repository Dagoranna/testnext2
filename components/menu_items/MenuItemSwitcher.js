'use client';

import styles from './MenuItem.module.css';
import { useState, useEffect } from 'react'; 

export default function MenuItemSwitcher({name, clickHandle, startState=false}) {
  const [switcherState, setSwitcherState] = useState(startState);

  function localClickHandle(e){
    e.stopPropagation();
    setSwitcherState(!switcherState);
    clickHandle();
  }

  return (
    <div className={ styles.itemSwitcher } onClick={ (e) => localClickHandle(e) }>
      <div className={ `${styles.switcherIndicator} ${switcherState ? styles.switcherOn : styles.switcherOff}`}></div>
      <div>{ name }</div>
    </div>
  );
}

//className={`${styles.sliderButton} ${styles.leftPart} ${userRole === 'Gamer' ? styles.buttonOn : styles.buttonOff}`}