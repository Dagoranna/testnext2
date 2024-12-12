'use client';

import { createContext, useContext, useState } from 'react';
import './globals.css';
import Head from 'next/head';
import FormWrapper from '../components/forms/FormWrapper';
import AuthForm from '../components/forms/AuthForm/AuthForm';

const RootContext = createContext();
export const useRootContext = () => useContext(RootContext);

export default function RootLayout({ children }) {
  const [loginState, setLoginState] = useState(false);

  return (
    <html lang="en">
      <Head>
        <title>Farm</title>
      </Head> 
      <body>
        <RootContext.Provider
          value={{
            loginState,
            setLoginState
          }}
        >          
          <FormWrapper formName='Login'>
            <AuthForm />
          </FormWrapper>
          <div>
            {children}
          </div>
        </RootContext.Provider>  
      </body>
    </html>
  )
}
