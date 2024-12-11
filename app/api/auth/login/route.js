import { makeHash } from '../../../../utils/generalUtils.js';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json(); // Парсинг тела запроса
  const { email, password } = body;
  console.log('/////////////////////////////////');
  console.log('email: ' + email);
  //const token = await makeHash(email+password);
 // const hashedpass = await makeHash(password);
 
  let baseData = await getData();
  
  return new Response(JSON.stringify({ message: 'catch', data: baseData }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
   //const { email, password } = req.body;
      /* FOR TEST
        const token = await makeHash(email+password);
        const hashedpass = await makeHash(password);
      FOR TEST */

      //const hashedpass = await makeHash(password);
     /* const { data, error: checkError } = await supabase
      .from('public.advancedauth')  
      .select('email')
      .eq('id', 1);      
*/

async function getData() {
  const { data, error } = await supabase
    .from('gamers')
    .select('gamer_name')  
    .eq('id', 1);           
  if (error) {
    console.error('Error:', error);
    return error;
  } else {
    return data;
  }
}
