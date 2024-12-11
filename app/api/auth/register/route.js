import { makeHash } from '../../../../utils/generalUtils.js';
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
/*  const body = await req.json(); // Парсинг тела запроса
  const { email, password } = body;

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
      const baseTokenData = await getToken(email); 

      if (baseTokenData.length === 0){
        const token = await makeHash(email+password);
        const setTokenAttempt = await writeTokenToBase(email,token);

        if (setTokenAttempt){
          return NextResponse.json({ message: 'login successful', loginState: true, token: token }, { status: 200 });
        } else {
          return NextResponse.json({ message: 'problem with token setting', loginState: false }, { status: 200 });
        }

      } else {
        const token = baseTokenData[0].authtoken;
        return NextResponse.json({ message: 'login successful', loginState: true, token: token }, { status: 200 });
      }
    }
  }
    */
}

async function writeTokenToBase(email,token) {
  const { error } = await supabase
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

