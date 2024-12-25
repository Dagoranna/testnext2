'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';

export default function TopPanel() {
  const itemsListGamer = [
    { itemname: 'Create charsheet', itemHandling: (e) => console.log('Create charsheet') },
    { itemname: 'Load charsheet', itemHandling: (e) => console.log('Load charsheet') },
    { itemname: 'Logout', itemHandling: async (e) => await handleLogout() },
  ];

  const itemsListMaster = [
    { itemname: 'Create map', itemHandling: (e) => console.log('Create map') },
    { itemname: 'Load map', itemHandling: (e) => console.log('Load map') },
    { itemname: 'Save map', itemHandling: (e) => console.log('Save map') },
    { itemname: 'Create game table', itemHandling: (e) => console.log('Create game table') },
    { itemname: 'Load game table', itemHandling: (e) => console.log('Load game table') },
    { itemname: 'Save game table', itemHandling: (e) => console.log('Save game table') },   
    { itemname: 'Logout', itemHandling: async (e) => await handleLogout() },
  ];  

  

  const { loginState, setLoginState, userEmail,setUserEmail, userRole } = useRootContext();

  async function handleLogout(){
    let response = await fetch('/api/auth/deleteauthtoken', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail, 
      }),
    });  

    let baseResponse = await response.json();

    if (response.ok) {
      if (baseResponse.logoutState === 1){
        setLoginState(false);
        setUserEmail('');
      } else {
        console.log(baseResponse.message);
      }
    } else {
      throw new Error('error in database response');
    }  
  }

  return (
    <div id='topPanel' className={styles.topPanel}>
      {loginState && (userRole == 'Gamer') && ( 
        <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsListGamer } />
      )}
      {loginState && (userRole == 'Master') && ( 
        <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsListMaster } />
      )}      
      {loginState && (
        <RoleSwitcher />
      )} 
    </div>
  );
}