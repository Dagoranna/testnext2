import { makeHash } from '../../../../utils/generalUtils.js';
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  const baseData = await getUser(email);
  
  if (baseData === null){
    return NextResponse.json({ message: 'Database error', resetHandlingState: false }, { status: 500 });  
  }

  if (baseData.length === 0){
    return NextResponse.json({ message: 'No such user', resetHandlingState: false }, { status: 200 });  
  } else {
    const hashedpass = await makeHash(password);
    const token = await makeHash(email+password);

    const resetAttempt = await saveNewPass(email,hashedpass,token);

    if (resetAttempt){
      return NextResponse.json({ message: 'Password successfully changed', resetHandlingState: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Password reset failed', resetHandlingState: false }, { status: 200 });
    }
  }
   
}

async function saveNewPass(email,password,token) {
  const { error } = await supabase
    .from('advancedauth')
    .update({ passwordhash: password, authtoken: token })    
    .eq('email', email);  
         
  if (error) {
    console.error('Error:', error);
    return false;
  } else {
    return true;
  }
}

async function getUser(email) {
  const { data, error } = await supabase
    .from('advancedauth')
    .select('*')
    .eq('email', email);   

  if (error) {
    console.error('Error:', error);
    return null;
  } else {
    return data;
  }
}