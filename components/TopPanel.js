'use client';
import styles from './TopPanel.module.css';
import DropDownMenu from './DropDownMenu';
import RoleSwitcher from './RoleSwitcher';
import { useState, useEffect } from 'react';
import FormWrapperFree from './forms/FormWrapperFree';
import { serverMessageHandling } from "../utils/generalUtils";
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../app/store/slices/mainSlice';
import { manageWebsocket } from "../app/store/slices/websocketSlice";

export default function TopPanel() {
  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.main.loginState); 
  const userEmail = useSelector((state) => state.main.userEmail);
  const userName = useSelector((state) => state.main.userName);
  const userRole = useSelector((state) => state.main.userRole);  
  const layout = useSelector((state) => state.main.layout); 
  const winList = useSelector((state) => state.main.winList);

  const serverMessage = useSelector((state) => state.websocket.serverMessage);
  const connectionState = useSelector((state) => state.websocket.connectionState);
  //const websocket = dispatch(connectWebSocket("process.env.NEXT_PUBLIC_SERVER_URL"));

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
    dispatch(actions.setLayout(windowsList));
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
    dispatch(actions.setUserName(newName));  
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
            itemHandling: async (e) => handleServerConnection(),
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
            itemHandling: async (e) => handleServerConnection(),
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

  function handleServerConnection(){
    console.log('connectionState = ' + connectionState);

    switch (connectionState) {
      case 3: 
        //checking and opening connection
        //const ws = new WebSocket("wss://quartz-spot-garden.glitch.me");
        dispatch(manageWebsocket('connect',process.env.NEXT_PUBLIC_SERVER_URL));
        break;
      case 1:
        //closing working connection
        dispatch(manageWebsocket('disconnect',process.env.NEXT_PUBLIC_SERVER_URL));
        break;
    }
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
        dispatch(actions.setLoginState(false));
        dispatch(actions.setUserEmail(''));
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