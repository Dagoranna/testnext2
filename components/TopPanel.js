'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';

export default function TopPanel() {
  const { loginState, setLoginState, userEmail,setUserEmail, userRole, layout, setLayout } = useRootContext();

  const itemsListGamer = [
    { itemName: 'Create charsheet', itemType: 'button', itemHandling: (e) => console.log('Create charsheet') },
    { itemName: 'Load charsheet', itemType: 'button', itemHandling: (e) => console.log('Load charsheet') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];

  const itemsListMaster = [
    { itemName: 'Create map', itemType: 'button', itemHandling: (e) => console.log('Create map') },
    { itemName: 'Load map', itemType: 'button', itemHandling: (e) => console.log('Load map') },
    { itemName: 'Save map', itemType: 'button', itemHandling: (e) => console.log('Save map') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];  

  function toggleWindow(item){
    const windowsList = layout.filter((window) => window.i !== item);
    if (layout.length == windowsList.length){
      const storedLayout = localStorage.getItem('layout');
      let currentWindowInfo = {};
      if (storedLayout) {
        const parsedLayout = JSON.parse(storedLayout);
        const currentWindowInfo = parsedLayout.find((l) => l.i === item);
        currentWindowInfo ? windowsList.push(currentWindowInfo) : windowsList.push({ i: item, x: 0, y: 0, w: 5, h: 15});
      } else {
        windowsList.push({ i: item, x: 0, y: 0, w: 5, h: 15});
      }
    }
    setLayout(windowsList);
  }

  const windowsListGamer = [
    { itemName: 'Game Map', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Game Map');
      },
      startState: layout.find((item) => item.i === 'Game Map'), 
    },
    { itemName: 'Polydice', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Polydice');
      },
      startState: layout.find((item) => item.i === 'Polydice'),
    },
    { itemName: 'Charsheet', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Charsheet');
      },
      startState: layout.find((item) => item.i === 'Charsheet'),
    },    
  ];

  const windowsListMaster = [
    { itemName: 'Game Map', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Game Map');
      },
      startState: layout.find((item) => item.i === 'Game Map'), 
    }    
  ];    

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
        <>
          <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsListGamer } />
          <DropDownMenu id='zoneMenu' title='Windows' itemsList={ windowsListGamer } />
        </>
      )}
      {loginState && (userRole == 'Master') && ( 
        <>
          <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsListMaster } />
          <DropDownMenu id='zoneMenu' title='Windows' itemsList={ windowsListMaster } />
        </>
      )}   
      {loginState && (
        <RoleSwitcher />
      )} 
    </div>
  );
}