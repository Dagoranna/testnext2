import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('token')?.value;   

  if (authToken){
    const baseData = await getEmailForToken(authToken);

    if (baseData === null){
      return NextResponse.json({ message: 'Database error', tokenState: -1 }, { status: 500 });  
    }

    if (baseData.length === 0){
      return NextResponse.json({ message: 'No such token', tokenState: -1 }, { status: 200 });  
    } else {
      return NextResponse.json({ message: 'Token valid', tokenState: 1, email: baseData[0].email }, { status: 200 });
    }
  } else {
    return NextResponse.json({ message: `No saved token for ${cookieStore.get('email')?.value}`, tokenState: -1 }, { status: 200 }); 
  }
}

async function getEmailForToken(token) {
  const { data, error } = await supabase
    .from('advancedauth')
    .select('email')
    .eq('authtoken', token);   

  if (error) {
    console.error('Error:', error);
    return null;
  } else {
    return data;
  }
}