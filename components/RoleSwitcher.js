'use client';

import styles from './RoleSwitcher.module.css';
import { useRootContext } from '../app/layout';

export default function RoleSwitcher() {
  const { userRole,setUserRole,layout,setLayout,winList } = useRootContext();

  function switchRole(role){
    if (userRole !== role){
      setUserRole(role);
    }

    const storedLayout = localStorage.getItem('layout');
    let currentWindowsInfo = [];

    if (storedLayout) {
      const parsedLayout = JSON.parse(storedLayout);

      parsedLayout.map((l) => {
        if (winList[role][l]) {
          currentWindowsInfo.push(l);
        }
      });
      setLayout(currentWindowsInfo);
    } else {
      if (role === 'Master'){
        setLayout([
          { i: 'Game Map', x: 0, y: 0, w: 5, h: 15},
        ]);
      } else {
        setLayout([
          { i: 'Game Map', x: 0, y: 0, w: 5, h: 15},
          { i: 'Polydice', x: 0, y: 0, w: 5, h: 15},
        ]);
      }      
    }
  }

  return (
    <div className={styles.roleSwitcher}>
      <div 
        className={`${styles.sliderButton} ${styles.leftPart} ${userRole === 'Gamer' ? styles.buttonOn : styles.buttonOff}`}
        onClick={() => switchRole('Gamer')}
      >Gamer</div>
      <div 
        className={`${styles.sliderButton} ${styles.rightPart} ${userRole === 'Master' ? styles.buttonOn : styles.buttonOff}`}
        onClick={() => switchRole('Master')}      
      >Master</div>
    </div>

  );
}
