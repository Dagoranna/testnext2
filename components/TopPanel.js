'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';
import { useState, useEffect } from 'react';
import FormWrapperFree from './forms/FormWrapperFree';

export default function TopPanel() {
  const { loginState, setLoginState, userEmail,setUserEmail, 
    userRole, layout, setLayout, winList, connectionState,
    setConnectionState, wSocket, SetWSocket, userName, setUserName } = useRootContext();

  const itemsListGamer = [
    { itemName: 'Change name', itemType: 'button', itemHandling: (e) => handleChangeName() },
    { itemName: 'Create charsheet', itemType: 'button', itemHandling: (e) => console.log('Create charsheet') },
    { itemName: 'Load charsheet', itemType: 'button', itemHandling: (e) => console.log('Load charsheet') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];

  const itemsListMaster = [
    { itemName: 'Change name', itemType: 'button', itemHandling: (e) => handleChangeName() },
    { itemName: 'Create map', itemType: 'button', itemHandling: (e) => console.log('Create map') },
    { itemName: 'Load map', itemType: 'button', itemHandling: (e) => console.log('Load map') },
    { itemName: 'Save map', itemType: 'button', itemHandling: (e) => console.log('Save map') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];  

  const [addComps, setAddComps] = useState(null);

  const [serverList, setServerList] = useState([]);

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

  function handleChangeName() {
    setAddComps(
      <FormWrapperFree formName='Enter new name' clearForm = { setAddComps }>
        <div className='tableTitle'>Enter new name</div>
        <form onSubmit={(e) => {
          e.preventDefault();  
          let newName = e.target.elements.newName.value;
          setUserName(newName);  
          localStorage.setItem('userName', newName);
          setAddComps();
        }}>
          <input 
            id="newName" 
            type="text"
            placeholder="Stranger"
            defaultValue={userName} 
            className="mainInput"
          />
          <button id='changeName' className="mainButton" type="submit">Save name</button>
        </form>
      </FormWrapperFree>
    );
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

  useEffect(() => {
    let connectTitle = '';
    let tempServerList = [];

    if (!connectionState) {

      if (userRole === 'Gamer') {
        connectTitle = 'Connect to game';
      } else {
        if (userRole === 'Master') connectTitle = 'Create game';
      }

      tempServerList.push( 
        { 
          itemName: connectTitle, 
          itemType: 'button', 
          itemHandling: async (e) => await handleServerConnectin(),
        }
      );

    } else {
      connectTitle = 'Disconnect';
      tempServerList.push( 
        { 
          itemName: connectTitle, 
          itemType: 'button', 
          itemHandling: async (e) => await handleServerConnectin(),
        }
      );      
    }

    setServerList(tempServerList);
  },[userRole,connectionState]);

  async function handleServerConnectin(){
    //TODO: server connection
    console.log('connectionState = ' + connectionState);
    if (!connectionState){
      //checking and opening connection
      //TODO: add check connection .readyState
      const ws = new WebSocket("wss://quartz-spot-garden.glitch.me");
      ws.addEventListener("open", () => {
        console.log("WebSocket connection established!");
        ws.send("Hello from client!");
      });

      ws.addEventListener("message", (event) => {
        console.log("Message received:", event.data);
      });

      ws.addEventListener("close", () => {
        console.log("WebSocket connection closed from server.");
      });

      SetWSocket(ws);
    } else {
      //closing connection
      wSocket.close();
      SetWSocket(false);
    }

    console.log(wSocket);
    setConnectionState(!connectionState);
  }

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
          <DropDownMenu id='zoneMenu' title='Interface' itemsList={ windowsList } />
        </>
      )}     
      {loginState && ( 
        <>
          <DropDownMenu id='serverMenu' title='Connection' itemsList={ serverList } />
        </>
      )}           
      {loginState && (
        <RoleSwitcher />
      )} 
      {loginState && (
        <div className = {styles.plainMessage }>Hello, <b>{ userName }</b>!</div>
      )}       
      { addComps }
    </div>
  );
}