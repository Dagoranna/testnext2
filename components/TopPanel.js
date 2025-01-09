'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';

export default function TopPanel() {
  const { loginState, setLoginState, userEmail,setUserEmail, userRole, layout, setLayout, winList, setWinList } = useRootContext();

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
    let tempWinList = structuredClone(winList);
    let tempLayout = structuredClone(layout);

    if (!winList[userRole][item]){
      const currentLayout = tempLayout.find((l) => l.i === item);
      if (currentLayout) {
        tempLayout.splice(tempLayout.indexOf(tempLayout.find((l) => l.i === item)),1);
      }
      //const currentLayout = false;
      //if (!currentLayout){
        const storedLayout = JSON.parse(localStorage.getItem('layout')).find((l) => l.i === item);
        if (storedLayout) {
          tempLayout.push(storedLayout);
        } else {
          tempLayout.push({ i: item, x: 0, y: 0, w: 5, h: 15});
        }
        setLayout(tempLayout);
      //}

      tempWinList[userRole][item] = true;
    } else {
      tempWinList[userRole][item] = false;
    }

    setWinList(tempWinList);
    localStorage.setItem('winlist', JSON.stringify(tempWinList));
    setLayout(tempLayout);
  }

  const windowsListGamer = [
    { itemName: 'Game Map', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Game Map');
      },
      startState: winList['Gamer']['Game Map']// && layout.find((item) => item.i === 'Game Map'), 
    },
    { itemName: 'Polydice', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Polydice');
      },
      startState: winList['Gamer']['Polydice']// && layout.find((item) => item.i === 'Polydice'),
    },
    { itemName: 'Charsheet', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Charsheet');
      },
      startState: winList['Gamer']['Charsheet']// && layout.find((item) => item.i === 'Charsheet'),
    },    
  ];

  const windowsListMaster = [
    { itemName: 'Game Map', 
      itemType: 'switcher', 
      itemHandling: (e) => {
        toggleWindow('Game Map');
      },
      startState: winList['Master']['Game Map']// && layout.find((item) => item.i === 'Game Map'), 
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