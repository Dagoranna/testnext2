import { makeHash } from '../../../../utils/generalUtils.js';
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email } = body;
  const apiUrl = process.env.API_URL;

  const baseData = await getUser(email);
  
  if (baseData === null){
    return NextResponse.json({ message: 'Database error', resetState: false }, { status: 500 });  
  }

  if (baseData.length === 0){
    return NextResponse.json({ message: 'No such user', resetState: false }, { status: 200 });  
  } else {

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const expireTime = new Date();  
    expireTime.setTime(expireTime.getTime() + 30 * 60 * 1000);

    const resettoken = await makeHash(email+expireTime);

    if (!writeResetTokenToBase(email,resettoken,expireTime)){
      return NextResponse.json({ message: 'Database error for saving reset token', resetState: false }, { status: 500 });  
    } else {
      const mailOptions = {
        from: 'icywizard1@gmail.com',
        to: email,
        subject: 'Password reset',
        text: `Please use this link to reset your password: ${apiUrl}/reset-password?email=${email}&token=${encodeURIComponent(resettoken)}`,
        html: `<p>Please use this <a href="${apiUrl}/reset-password?email=${email}&token=${encodeURIComponent(resettoken)}">link</a> to reset your password.</p>`,
      };  
      
      try {
        await transporter.sendMail(mailOptions);
        return new Response(JSON.stringify({ message: 'Email sent successfully!', resetPassState: true }), { status: 200 });
      } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Error sending email', error, resetPassState: false }), { status: 500 });
      }        
    }
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

async function writeResetTokenToBase(email,resettoken,expireTime) {

  const { error } = await supabase
    .from('advancedauth')
    .update({ resettoken: resettoken, resettokentime: expireTime })    
    .eq('email', email);           
  if (error) {
    console.error('Error:', error);
    return false;
  } else {
    return true;
  }
}