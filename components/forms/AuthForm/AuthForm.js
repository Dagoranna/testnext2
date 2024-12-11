'use client';

import { useState } from "react";

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formMode, setFormMode] = useState('Login');//Login/Register/Reset password

  async function handleSubmit(e){
    e.preventDefault();
    console.log(formMode);
    switch (formMode) {
      case 'Login': 
        fetch('/api/auth/login', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callbackUrl: '/', 
            email: email, 
            password: password, 
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to sign in');
            }
            return response.json();
          })
          .then((data) => {
            console.log('Sign-in successful:');
            console.table(data);
          })
          .catch((error) => {
            console.error('Error signing in:', error);
          });      
        break;
      case 'Register':
        break;
      case 'Reset password':
        break;
      default: 
        console.log('some trash in formMode: ' + formMode);  
    } 
  }

  return (
    <form id='authForm' onSubmit={handleSubmit}>
      <div id='authInputFields'>
        <div className='tableTitle'>{ formMode }</div>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mainInput"
        />

        {(formMode !== 'Reset password') && (
          <input 
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mainInput"
          /> 
        )}   

        {(formMode == 'Register') && (
          <input 
            type="password"
            placeholder="confirm password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
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
/*
export default function AuthForm2() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e){
    e.preventDefault();

    if (isRegister) {
      // Регистрация через Supabase
      const { data, error: checkError } = await supabase
      .from('users')  // Используем таблицу 'users' для поиска email
      .select('email')
      .eq('email', email)
      .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          console.log(error);
          setMessage("Registration failed: " + error.message);
          return;
        }
        setMessage("Registration successful! Please check your email.");
        return;
      } else {
        console.log(checkError);
        setMessage("Email is already registered.");
        return;
      } 
    }

    // Вход через NextAuth
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      remember: rememberMe, // Передаём состояние галочки
    });

    if (result.error) {
      setMessage("Login failed: " + result.error);
    } else {
      setMessage("Login successful!");
    }
  };

  async function handleResetPassword(){
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage("Reset failed: " + error.message);
    } else {
      setMessage("Password reset email sent!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mainInput"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mainInput"
      />

      {!isRegister && (
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          Remember me
        </label>
      )}
      <button className="mainButton" type="submit">{isRegister ? "Register" : "Login"}</button>
      <button
        type="button"
        className="mainButton"
        onClick={() => setIsRegister((prev) => !prev)}
      >
        Switch to {isRegister ? "Login" : "Register"}
      </button>
      {!isRegister && (
        <button type="button" className="mainButton" onClick={handleResetPassword}>
          Reset Password
        </button>
      )}
      {message && <p>{message}</p>}
    </form>
  );
}
*/