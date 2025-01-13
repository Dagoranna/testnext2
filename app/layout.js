'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import './globals.css';
import Head from 'next/head';
import FormWrapper from '../components/forms/FormWrapper';
import AuthForm from '../components/forms/AuthForm/AuthForm';
import TopPanel from '../components/TopPanel';

const RootContext = createContext();
export const useRootContext = () => useContext(RootContext);

export default function RootLayout({ children }) {
  const [loginState, setLoginState] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Gamer');
  const [winList, setWinList] = useState({
    'Gamer':['Game Map','Polydice','Charsheet'],
    'Master':['Game Map','Polydice','Game Table']
  });

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
    const storedLayout = localStorage.getItem('layout');
    if (storedLayout) setLayout(JSON.parse(storedLayout));

    const hiddenLayout = localStorage.getItem('hiddenLayout');
    if (!hiddenLayout){
      localStorage.setItem('hiddenLayout', JSON.stringify(layout));
    }
  },[]);

  return (
    <html lang="en">
      <Head>
        <title>Farm</title>
      </Head> 
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
            winList
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


