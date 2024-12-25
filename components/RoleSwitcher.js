'use client';

import styles from './RoleSwitcher.module.css';
import { useRootContext } from '../app/layout';

export default function RoleSwitcher() {
  const { userRole,setUserRole } = useRootContext();

  function switchRole(role){
    if (userRole !== role){
      setUserRole(role);
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
