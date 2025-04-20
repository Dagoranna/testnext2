import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
}
export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email } = body;

  const store = await getGamesList(email);
  let parsedStore: Record<string, string> = {};

  if (store !== null){
    parsedStore = JSON.parse(store);
  } else {
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

async function getGamesList(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("players")
    .select("master_game")
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return null;
  }

  return data[0].master_game ?? null;
}
