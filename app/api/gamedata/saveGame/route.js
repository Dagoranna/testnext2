import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email, title, gamedata } = body;

  const store = await getGamesList(email);
  let parsedStore;
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

async function setGamesList(email, newStore) {
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

async function getGamesList(email) {
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

/* return new Response(JSON.stringify({ message: 'catch', data: baseData}), {
   status: 200,
   headers: { 'Content-Type': 'application/json' },
 });*/
