import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
}

type CharsheetStore = Record<string, unknown>;

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email } = body;

  const store = await getCharsheetsList(email);
  let parsedStore: CharsheetStore = {};
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
