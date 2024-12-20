'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';

export default function TopPanel() {
  const itemsList = [
    { itemname: 'Option 1111111111', itemHandling: (e) => console.log('Clicked Option 1') },
    { itemname: 'Option 2', itemHandling: (e) => console.log('Clicked Option 2') },
  ];

  return (
    <div id='topPanel' className={styles.topPanel}>
      <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsList } />
    </div>
  );
}