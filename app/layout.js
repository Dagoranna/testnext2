'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import './globals.css';
import FormWrapper from '../components/forms/FormWrapper';
import AuthForm from '../components/forms/AuthForm/AuthForm';
import TopPanel from '../components/TopPanel';

const RootContext = createContext();
export const useRootContext = () => useContext(RootContext);

export default function RootLayout({ children }) {
  const [loginState, setLoginState] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Stranger');
  const [userRole, setUserRole] = useState('Gamer');
  const [winList, setWinList] = useState({
    'Gamer':['Game Map','Polydice','Charsheet'],
    'Master':['Game Map','Polydice','Game Table']
  });
  const [connectionState, setConnectionState] = useState(false);
  const [wSocket, SetWSocket] = useState(false);

  const [layout, setLayout] = useState([
    { i: 'Game Map', x: 0, y: 0, w: 5, h: 15},
    { i: 'Polydice', x: 0, y: 0, w: 5, h: 15},
  ]);

  useEffect(() => {
    async function checkAuthToken(){
      let response = await fetch('/api/auth/checkauthtoken', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
      });  

      let baseResponse = await response.json();

      if (response.ok) {
        if (baseResponse.tokenState === 1){
          setLoginState(true);
          setUserEmail(baseResponse.email);
          console.log(baseResponse.message);
        } else {
          console.log(baseResponse.message);
        }
      } else {
        throw new Error('error in database response');
      }      
    }

    checkAuthToken();

  },[]);

  useEffect(() => {
    const oldName = localStorage.getItem('userName');
    if (oldName){
      setUserName(oldName);
    }
  },[]);
  
  useEffect(() => {
    const storedWinList = localStorage.getItem('winlist');
    console.log(storedWinList);
    if (storedWinList){
      setWinList(JSON.parse(storedWinList));
    } else {
      localStorage.setItem('winlist', JSON.stringify(winList));
    }
  },[]);

  useEffect(() => {
    const storedLayout = localStorage.getItem('layout');
    if (storedLayout) setLayout(JSON.parse(storedLayout));
  },[]);

  useEffect(() => {
    const storedLayout = localStorage.getItem('layout');
    if (storedLayout) setLayout(JSON.parse(storedLayout));

    const hiddenLayout = localStorage.getItem('hiddenLayout');
    if (!hiddenLayout){
      localStorage.setItem('hiddenLayout', JSON.stringify(layout));
    }
  },[]);

  useEffect(() => { 
    console.log('layout was changed');
    localStorage.setItem('layout', JSON.stringify(layout));
    const hiddenLayout = JSON.parse(localStorage.getItem('hiddenLayout'));
    const tempLayout = structuredClone(layout);

    hiddenLayout.map((item) => {
      let tempItem = tempLayout.find((l) => l.i === item.i);
      if (tempItem){
        item.x = tempItem.x;
        item.y = tempItem.y;
        item.w = tempItem.w;
        item.h = tempItem.h;        
      }
    });

    localStorage.setItem('hiddenLayout', JSON.stringify(hiddenLayout));

    const activeWinList = layout.map((l) => l.i);
    console.log(activeWinList);
    localStorage.setItem(`activeWinList${userRole}`, JSON.stringify(activeWinList));
  },[layout]);   
  

 // const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

 /* useEffect(() => {
      const ws = new WebSocket("wss://quartz-spot-garden.glitch.me");
      setSocket(ws);
      ws.addEventListener("open", () => {
        console.log("WebSocket connection established!");
        ws.send("Hello from client!");
      });


  }, []);*/

  useEffect(() => {
    //TODO: сделать коннект/дисконнект с сервером

  },[connectionState]);



  return (
    <html lang="en">
      <body>
        <RootContext.Provider
          value={{
            loginState,
            setLoginState,
            userEmail,
            setUserEmail,
            userRole, 
            setUserRole,
            layout, 
            setLayout,
            winList,
            setWinList,
            connectionState,
            setConnectionState,
            wSocket, 
            SetWSocket,
            userName, 
            setUserName
          }}
        >     
          {!loginState && (<FormWrapper formName='Login'>
            <AuthForm />
          </FormWrapper>)}
          <TopPanel />
          <div>
            {children}
          </div>
        </RootContext.Provider>  
      </body>
    </html>
  )
}


