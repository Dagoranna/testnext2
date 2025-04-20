import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  title: string;
  gamedata: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, title, gamedata } = body;

  const store = await getGamesList(email);
  let parsedStore: Record<string, string> = {};
  try {
    parsedStore = JSON.parse(store);
  } catch {
    parsedStore = {};
  }
  parsedStore[title] = gamedata;
  const newStore = JSON.stringify(parsedStore);
  let resSaving = await setGamesList(email, newStore);

  if (resSaving) {
    return NextResponse.json(
      { message: "game saved successfully", saveState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "saving failed", saveState: false },
      { status: 500 }
    );
  }
}

async function setGamesList(email: string, newStore: string) {
  const { data, error } = await supabase
    .from("players")
    .update({ master_game: newStore })
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getGamesList(email: string) {
  const { data, error } = await supabase
    .from("players")
    .select("master_game")
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  }

  if (!data || !data[0]) return {};
  return data[0].master_game ?? {};
}

