import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  name: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, name } = body;

  const baseData = await getName(email);
  
  if (baseData === null){
    return NextResponse.json({ message: 'database error', userState: false }, { status: 500 });  
  }

  if (baseData.length === 0){
    const newUser = await createUser(email, name);
    if (!newUser) {
      return NextResponse.json({ message: 'user creation failed', userState: false }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'name created', userState: true }, { status: 200 })
    }
  } else {
    const nameUpdated = await updateUserName(email,name);
    if (!nameUpdated) {
      return NextResponse.json({ message: 'name update failed', userState: false }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'name changed', userState: true }, { status: 200 })
    }   
  }
}

async function createUser(email: string, name: string) {
  const { error } = await supabase
    .from('players')
    .insert([
      { gamer_mail: email, gamer_name: name }
    ]);
         
  if (error) {
    console.error('Error:', error);
    return false;
  } else {
    return true;
  }
}

async function updateUserName(email: string, name: string) {
  const { data, error } = await supabase
    .from('players')
    .update({ gamer_name: name })    
    .eq('gamer_mail', email);    
    
  if (error) {
    console.error('Error:', error);
    return false;
  } else {
    return true;
  }
}

async function getName(email: string) {
  const { data, error } = await supabase
    .from('players')
    .select('gamer_name')  
    .eq('gamer_mail', email);           
  if (error) {
    console.error('Error:', error);
    return null;
  } else {
    return data;
  }
}
