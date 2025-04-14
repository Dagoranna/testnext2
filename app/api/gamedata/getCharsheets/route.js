import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email } = body;

  const store = await getCharsheetsList(email);
  let parsedStore;
  try {
    parsedStore = JSON.parse(store);
  } catch {
    parsedStore = {};
  }
  if (parsedStore) {
    return NextResponse.json(
      { message: parsedStore, getState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "loading failed", getState: false },
      { status: 500 }
    );
  }
  /*
  parsedStore[title] = chardata;
  const newStore = JSON.stringify(parsedStore);
  let resSaving = await setCharsheetsList(email, newStore);

  if (resSaving) {
    return NextResponse.json(
      { message: "charsheet saved successfully", saveState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "saving failed", saveState: false },
      { status: 500 }
    );
  }*/
}

/*async function setCharsheetsList(email, newStore) {
  const { data, error } = await supabase
    .from("players")
    .update({ gamer_charsheet: newStore })
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}*/

async function getCharsheetsList(email) {
  const { data, error } = await supabase
    .from("players")
    .select("gamer_charsheet")
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  }

  if (!data || !data[0]) return {};
  return data[0].gamer_charsheet ?? {};
}
