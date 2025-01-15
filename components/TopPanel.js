'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';

export default function TopPanel() {
  const { loginState, setLoginState, userEmail,setUserEmail, userRole, layout, setLayout, winList } = useRootContext();

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
    console.log(item);
    let currentWindowInfo = false;
    const windowsList = layout.filter((window) => window.i !== item);

    if (layout.length == windowsList.length){
      //no such window, show it
      const storedLayout = localStorage.getItem('layout');

      if (storedLayout) {
        const parsedLayout = JSON.parse(storedLayout);
        currentWindowInfo = parsedLayout.find((l) => l.i === item);
      }

      if (currentWindowInfo) {
        windowsList.push(currentWindowInfo);
      } else {
        const hiddenLayout = localStorage.getItem('hiddenLayout');
        if (hiddenLayout) {
          const parsedHiddenLayout = JSON.parse(hiddenLayout);
          currentWindowInfo = parsedHiddenLayout.find((l) => l.i === item);
          if (currentWindowInfo){
            windowsList.push(currentWindowInfo);
          } else {
            windowsList.push({ i: item, x: 0, y: 0, w: 5, h: 15});
          }
        } else {
          windowsList.push({ i: item, x: 0, y: 0, w: 5, h: 15});
        }
      }
    } else {
      //hide window
      const winForHide = layout.find((window) => window.i === item);
      const hiddenLayout = localStorage.getItem('hiddenLayout');
      const parsedHiddenLayout = JSON.parse(hiddenLayout);
      const winInHidden = parsedHiddenLayout.find((window) => window.i === item);
      if (!winInHidden) {
        parsedHiddenLayout.push(winForHide);
      } else {
        parsedHiddenLayout.splice(parsedHiddenLayout.indexOf(winInHidden),1,(winForHide));
      }
      localStorage.setItem('hiddenLayout', JSON.stringify(parsedHiddenLayout));
    }
    setLayout(windowsList);
    localStorage.setItem('layout', JSON.stringify(windowsList));
  }

  const windowsList = winList[userRole].map((item)=>{
    return { 
      itemName: item, 
      itemType: 'switcher', 
      itemHandling: () => {
        toggleWindow(item);
      },
      startState: layout.find((l) => l.i === item), 
    }
  });

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
        </>
      )}
      {loginState && (userRole == 'Master') && ( 
        <>
          <DropDownMenu id='mainMenu' title='Main menu' itemsList={ itemsListMaster } />
        </>
      )}   
      {loginState && ( 
        <>
          <DropDownMenu id='zoneMenu' title='Windows' itemsList={ windowsList } />
        </>
      )}       
      {loginState && (
        <RoleSwitcher />
      )} 
    </div>
  );
}