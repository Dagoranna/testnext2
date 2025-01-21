import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email } = body;

  const baseData = await getName (email);
  
  if (baseData === null){
    return NextResponse.json({ message: 'database error',userState: false }, { status: 500 });  
  }

  if (baseData.length === 0){
    return NextResponse.json({ message: 'Stranger', userState: false }, { status: 200 });    
  } else {
    return NextResponse.json({ message: baseData[0].gamer_name, userState: true }, { status: 200 });
  }
}

async function getName(email) {
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

