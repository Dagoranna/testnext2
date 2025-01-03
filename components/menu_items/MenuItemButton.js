'use client';

import styles from './MenuItem.module.css';

export default function MenuItemButton({name, clickHandle}) {

  return (
    <div className={ styles.itemButton } onClick={ (e) => clickHandle(e) }>
      { name }
    </div>
  );
}