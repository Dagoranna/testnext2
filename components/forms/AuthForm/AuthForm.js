'use client';
import { useState, useEffect } from "react";
import { removeItemFromArray } from "../../../utils/generalUtils";
import { useRootContext } from '../../../app/layout';
import FormErrors from "../FormErrors";
import stylesFormWrapper from "../FormWrapper.module.css";

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formMode, setFormMode] = useState('Login');//Login/Register/Reset password
  const [formLoginErrors, setFormLoginErrors] = useState([]);
  const [formRegisterErrors, setFormRegisterErrors] = useState([]);
  const [formResetPassErrors, setFormResetPassErrors] = useState([]);
  const [actionResult, setActionResult] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const { loginState, setLoginState, setUserEmail } = useRootContext();

  useEffect(() => {
    setFormLoginErrors([]);
    setFormRegisterErrors([]);
    setFormResetPassErrors([]);
    setActionMessage('');
    setEmail('');
    setPassword('');
    setPassword2('');
    setRememberMe(false);    
  }, [formMode]);

  useEffect(() => {
    let errors = [];
    switch (formMode) {
      case 'Login':
        errors = [...formLoginErrors];
        break;
      case 'Register':
        errors = [...formRegisterErrors];
        break;
      case 'Reset password':
        errors = [...formResetPassErrors];
        break;
    }
    
    //email checks
    if (email.trim() === "" && !errors.includes('Email is empty')) {
      errors.push('Email is empty');
    }
    if (email.trim() !== "" && errors.includes('Email is empty')) {
      errors = removeItemFromArray(errors,'Email is empty');
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) && email.trim() !== "" && !errors.includes('Invalid email')) {
      errors.push('Invalid email');
    }
    if (errors.includes('Invalid email') && (emailRegex.test(email) || email.trim() === "")) {
      errors = removeItemFromArray(errors,'Invalid email');
    }  

    if (formMode !== 'Reset password'){
      //password checks
      if (password.trim() === "" && !errors.includes('Password is empty')) {
        errors.push('Password is empty');
      }
      if (password.trim() !== "" && errors.includes('Password is empty')) {
        errors = removeItemFromArray(errors,'Password is empty');
      }    
    }

    //second password checks
    if (formMode === 'Register'){
      if (password2.trim() !== password.trim() && !errors.includes('Passwords do not match')) {
        errors.push('Passwords do not match');
      }
      if (password2.trim() === password.trim() && errors.includes('Passwords do not match')) {
        errors = removeItemFromArray(errors,'Passwords do not match');
      }
    }

    switch (formMode) {
      case 'Login':
        setFormLoginErrors(errors);
        break;
      case 'Register':
        setFormRegisterErrors(errors);
        break;
      case 'Reset password':
        setFormResetPassErrors(errors);
        break;
    }

  }, [email, password, password2, formMode]);

  async function handleSubmit(e){
    e.preventDefault();
    console.log(formMode);
    switch (formMode) {
      case 'Login': {
        if (formLoginErrors.length !== 0) {
          console.log(formLoginErrors);
          break;
        }

        let response = await fetch('/api/auth/login', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callbackUrl: '/', 
            email: email, 
            password: password, 
            rememberMe: rememberMe,
          }),
        });

        let baseResponse = await response.json();

        if (response.ok) {
          if (baseResponse.loginState === true){
            setLoginState(true);
            console.log(baseResponse.message);
            setActionMessage(baseResponse.message);
            console.log('email = '+ email);
            setUserEmail(email);
            setActionResult(true);
          } else {
            setLoginState(false);
            console.log(baseResponse.message);
            setActionMessage(baseResponse.message);
            setActionResult(false);
          }
        } else {
          throw new Error('error in database response');
        }

        break;
      }
      case 'Register': {
        if (formRegisterErrors.length !== 0) break;

        const response = await fetch('/api/auth/register', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callbackUrl: '/', 
            email: email, 
            password: password, 
          }),
        });

        const baseResponse = await response.json();

        if (response.ok) {
          if (baseResponse.registerState === true){
            //TODO: register successful logic
            setActionMessage(baseResponse.message);
            setActionResult(true);
          } else {
            setActionMessage(baseResponse.message);
            setActionResult(false);
          }
        } else {
          throw new Error('error in database response');
        }        
        break;
      }
      case 'Reset password':{
        if (formResetPassErrors.length !== 0) {
          console.log(formResetPassErrors);
          break;
        }

        let response = await fetch('/api/auth/resetpass', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callbackUrl: '/', 
            email: email, 
          }),
        });

        let baseResponse = await response.json();

        if (response.ok) {
          if (baseResponse.resetPassState === true){
            //TODO: reset mail sent
            console.log(baseResponse.message);
            setActionMessage(baseResponse.message);
            setActionResult(true);
          } else {
            console.log(baseResponse.message);
            setActionMessage(baseResponse.message);
            setActionResult(false);
          }
        } else {
          throw new Error('error in database response');
        }

        break;
      }
      default: 
        console.log('some trash in formMode: ' + formMode);  
    } 
  }

  return (
    <form id='authForm' onSubmit={handleSubmit}>
      <div id='authInputFields'>
        <div className='tableTitle'>{ formMode }</div>
        <div className={ actionResult ? stylesFormWrapper.actionSuccess : stylesFormWrapper.actionFail }>{ actionMessage }</div>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mainInput"
        />

        {(formMode !== 'Reset password') && (
          <input 
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mainInput"
          /> 
        )}   

        {(formMode == 'Register') && (
          <input 
            type="password"
            placeholder="confirm password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mainInput"
          /> 
        )}
        {(formMode == 'Login') && ( 
          <div>
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>   
          </div>  
        )}

        {(formMode == 'Login') && ( 
          <FormErrors formErrors={formLoginErrors} />
        )}
        {(formMode == 'Register') && ( 
          <FormErrors formErrors={formRegisterErrors} />
        )}
        {(formMode == 'Reset password') && ( 
          <FormErrors formErrors={formResetPassErrors} />
        )}                

        <button id='authButton' className="mainButton" type="submit">{ formMode }</button>
      </div>
      <div id='authSwitchers'>
        {(formMode !== 'Login') && ( 
          <div 
            id='goToLogin'
            onClick={() => setFormMode('Login')}
            className='switcher'
          >
            Go to login
          </div>
        )}
        {(formMode !== 'Reset password') && ( 
          <div 
            id='goToReset'
            onClick={() => setFormMode('Reset password')}
            className='switcher'
          >
            Go to reset password
          </div>
        )} 
        {(formMode !== 'Register') && ( 
          <div 
            id='goToRegister'
            onClick={() => setFormMode('Register')}
            className='switcher'
          >
            Go to registration
          </div>
        )}               
      </div>
    </form>
  );
}
