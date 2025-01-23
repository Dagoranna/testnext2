'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import { useRootContext } from '../app/layout';
import RoleSwitcher from './RoleSwitcher';
import { useState, useEffect } from 'react';
import FormWrapperFree from './forms/FormWrapperFree';
import { serverMessageHandling } from "../utils/generalUtils";

export default function TopPanel() {
  const { loginState, setLoginState, userEmail,setUserEmail, 
    userRole, layout, setLayout, winList, connectionState,
    setConnectionState, wSocket, SetWSocket, userName, setUserName } = useRootContext();

  const itemsListGamer = [
    { itemName: 'Change name', itemType: 'button', itemHandling: async (e) => await handleChangeName() },
    { itemName: 'Create charsheet', itemType: 'button', itemHandling: (e) => console.log('Create charsheet') },
    { itemName: 'Load charsheet', itemType: 'button', itemHandling: (e) => console.log('Load charsheet') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];

  const itemsListMaster = [
    { itemName: 'Change name', itemType: 'button', itemHandling: async (e) => await handleChangeName() },
    { itemName: 'Create map', itemType: 'button', itemHandling: (e) => console.log('Create map') },
    { itemName: 'Load map', itemType: 'button', itemHandling: (e) => console.log('Load map') },
    { itemName: 'Save map', itemType: 'button', itemHandling: (e) => console.log('Save map') },
    { itemName: 'Logout', itemType: 'button', itemHandling: async (e) => await handleLogout() },
  ];  

  const [addComps, setAddComps] = useState(null);
  const [menuStyle, SetMenuStyle] = useState('');

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

  async function handleChangeName() {
    setAddComps(
      <FormWrapperFree formName='Enter new name' clearForm = { setAddComps }>
        <div className='tableTitle'>Enter new name</div>
        <form onSubmit={async (e) => await setNewUserName(e.target.elements.newName.value,e)}>
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

  async function setNewUserName(newName,e){
    e.preventDefault();
    setUserName(newName);  
    //localStorage.setItem('userName', newName);
    let response = await fetch('/api/gamedata/setname', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail, 
        name: newName,
      }),
    });  

    //TODO: add error handling      
    setAddComps();
    
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

    switch (connectionState) {
      case 3:
        if (userRole === 'Gamer') {
          connectTitle = 'Connect to game';
        } else {
          if (userRole === 'Master') connectTitle = 'Create game';
        }

        tempServerList.push( 
          { 
            itemName: connectTitle, 
            itemType: 'button', 
            itemHandling: async (e) => await handleServerConnection(),
          }
        );
        break;
      case 2:  
        connectTitle = 'Disconnecting...';
        tempServerList.push( 
          { 
            itemName: connectTitle, 
            itemType: 'button', 
            itemHandling: () => {},
          }
        ); 
        break;  
      case 1:  
        connectTitle = 'Disconnect';
        tempServerList.push( 
          { 
            itemName: connectTitle, 
            itemType: 'button', 
            itemHandling: async (e) => await handleServerConnection(),
          }
        ); 
        break;  
      case 0:  
        connectTitle = 'Connecting...';
        tempServerList.push( 
          { 
            itemName: connectTitle, 
            itemType: 'button', 
            itemHandling: () => {},
          }
        ); 
        break;                   
    }

    setServerList(tempServerList);
  },[userRole,connectionState]);

  async function handleServerConnection(){
    console.log('connectionState = ' + connectionState);
    let ws = wSocket;

    switch (connectionState) {
      case 3: 
        //checking and opening connection
        //TODO: add check connection .readyState
        //const ws = new WebSocket("wss://quartz-spot-garden.glitch.me");
        ws = new WebSocket(process.env.NEXT_PUBLIC_SERVER_URL);
        setConnectionState(0);

        ws.addEventListener("open", () => {
          console.log("WebSocket connection established!");
          const dataForServer = {role: userRole, name: userName};
          ws.send(JSON.stringify(dataForServer));
          setConnectionState(1);
        });

        ws.addEventListener("message", (event) => {
          serverMessageHandling(event.data);
          console.log("Message received:", event.data);
        });

        ws.addEventListener("close", () => {
          console.log("WebSocket connection closed from server.");
          setConnectionState(3);
        });

        SetWSocket(ws);
        break;
      case 1:
        //closing working connection
        wSocket.close();
        setConnectionState(3);
        break;
    }

    //console.log('-------------------');
    //console.log(ws);
   // console.log(userName);
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

  useEffect( () => {
    switch (connectionState) {
      case 1: 
        SetMenuStyle('activeStyle');
        break;
      case 3:   
        SetMenuStyle('passiveStyle');
        break;
      default:
        SetMenuStyle('changingStyle');
        break;          
    }
  },[connectionState]);

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
          <DropDownMenu id='serverMenu' title='Connection' itemsList={ serverList } addStyle={ menuStyle } />
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