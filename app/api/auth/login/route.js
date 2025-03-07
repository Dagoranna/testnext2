import { makeHash } from '../../../../utils/generalUtils.js';
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email, password, rememberMe } = body;

  const baseData = await getPass(email);
  
  if (baseData === null){
    return NextResponse.json({ message: 'database error', loginState: false }, { status: 500 });  
  }

  if (baseData.length === 0){
    return NextResponse.json({ message: 'no user', loginState: false }, { status: 200 });    
  } else {
    const passwordhash = baseData[0].passwordhash;
    const hashedpass = await makeHash(password);

    if (passwordhash !== hashedpass){
      return NextResponse.json({ message: 'wrong password', loginState: false }, { status: 200 });
    } else {
      if (rememberMe){
        const baseTokenData = await getToken(email); 

        /*if ((baseTokenData[0].authtoken == '') || (baseTokenData[0].authtoken == null)){*/
        const token = await makeHash(email+password);
        const setTokenAttempt = await writeTokenToBase(email,token);

        if (setTokenAttempt){
          const expirationDate = new Date();
          expirationDate.setFullYear(expirationDate.getFullYear() + 5);
      
          const response = NextResponse.json({ message: 'login successful, token saved', loginState: true }, { status: 200 });

          response.headers.append(
            'Set-Cookie',
            `token=${token}; Path=/; HttpOnly; Secure; Expires=${expirationDate.toUTCString()}`
          );   
          response.headers.append(
            'Set-Cookie',
            `email=${email}; Path=/; HttpOnly; Secure; Expires=${expirationDate.toUTCString()}`
          );            
      
          return response;
        } else {
          return NextResponse.json({ message: 'problem with token setting', loginState: false }, { status: 200 });
        }

        /*} else {
          return NextResponse.json({ message: 'login successful, token already exists', loginState: true }, { status: 200 });
        }*/
      } else {
        return NextResponse.json({ message: 'session login successful', loginState: true }, { status: 200 });
      }
    }
  }
}

async function writeTokenToBase(email,token) {

  const { data, error } = await supabase
    .from('advancedauth')
    .update({ authtoken: token })    
    .eq('email', email);    
    
  if (error) {
    console.error('Error:', error);
    return false;
  } else {
    return true;
  }
}

async function getPass(email) {
  const { data, error } = await supabase
    .from('advancedauth')
    .select('passwordhash')  
    .eq('email', email);           
  if (error) {
    console.error('Error:', error);
    return null;
  } else {
    return data;
  }
}

async function getToken(email) {
  const { data, error } = await supabase
    .from('advancedauth')
    .select('authtoken')  
    .eq('email', email);  

  if (error) {
    console.error('Error:', error);
    return null;
  } else {
    return data;
  }
}


 
/* return new Response(JSON.stringify({ message: 'catch', data: baseData}), {
   status: 200,
   headers: { 'Content-Type': 'application/json' },
 });*/

