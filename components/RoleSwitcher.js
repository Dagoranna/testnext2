'use client';

import styles from './RoleSwitcher.module.css';
import { useRootContext } from '../app/layout';

export default function RoleSwitcher() {
  const { userRole,setUserRole,layout,setLayout,winList } = useRootContext();

  function switchRole(role){
    if (userRole !== role){
      setUserRole(role);
      const activeWins = JSON.parse(localStorage.getItem(`activeWinList${userRole}`));
      const hiddenLayout = JSON.parse(localStorage.getItem('hiddenLayout'));
      const newLayout = [];

      activeWins.map((item) => {
        //item = Polydice, etc
        if (winList[role].includes(item)){
          let layItem = hiddenLayout.find((l) => l.i === item);
          if (layItem){
            newLayout.push(hiddenLayout.find((l) => l.i === item));
          } else {
            newLayout.push({ i: item, x: 0, y: 0, w: 5, h: 15});
          }
        }
      });
      setLayout(newLayout);
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
