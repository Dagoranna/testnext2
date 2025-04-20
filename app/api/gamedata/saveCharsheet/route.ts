import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  title: string;
  chardata: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, title, chardata } = body;

  const store = await getCharsheetsList(email);
  let parsedStore: Record<string, string> = {};

  try {
    parsedStore = JSON.parse(store);
  } catch {
    parsedStore = {};
  }

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
  }
}

async function setCharsheetsList(email: string, newStore: string) {
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
}

async function getCharsheetsList(email: string) {
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

