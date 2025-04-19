import { makeHash } from "../../../../utils/generalUtils";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const baseData = await getUser(email);

  if (baseData === null) {
    return NextResponse.json(
      { message: "Database error", registerState: false },
      { status: 500 }
    );
  }

  if (baseData.length !== 0) {
    return NextResponse.json(
      { message: "User already exists", registerState: false },
      { status: 200 }
    );
  } else {
    const hashedpass = await makeHash(password);
    const token = await makeHash(email + password);

    const regAttempt = await saveUserToBase(email, hashedpass, token);

    if (regAttempt) {
      //API_URL
      let response = await fetch(
        `${process.env.API_URL}/api/gamedata/setname`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            name: "Stranger",
          }),
        }
      );
      return NextResponse.json(
        { message: "Registration successful", registerState: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Registration failed", registerState: false },
        { status: 200 }
      );
    }
  }
}

async function saveUserToBase(email: string, password: string, token: string) {
  const { error } = await supabase
    .from("advancedauth")
    .insert([{ email: email, passwordhash: password, authtoken: token }]);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getUser(email: string) {
  const { data, error } = await supabase
    .from("advancedauth")
    .select("*")
    .eq("email", email);

  if (error) {
    console.error("Error:", error);
    return null;
  } else {
    return data;
  }
}
