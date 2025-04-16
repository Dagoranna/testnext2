import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email, title, mapdata } = body;

  const store = await getMapsList(email);
  let parsedStore;
  try {
    parsedStore = JSON.parse(store);
  } catch {
    parsedStore = {};
  }
  parsedStore[title] = mapdata;
  const newStore = JSON.stringify(parsedStore);
  let resSaving = await setMapsList(email, newStore);

  if (resSaving) {
    return NextResponse.json(
      { message: "map saved successfully", saveState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "saving failed", saveState: false },
      { status: 500 }
    );
  }
}

async function setMapsList(email, newStore) {
  const { data, error } = await supabase
    .from("players")
    .update({ master_map: newStore })
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getMapsList(email) {
  const { data, error } = await supabase
    .from("players")
    .select("master_map")
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  }

  if (!data || !data[0]) return {};
  return data[0].master_map ?? {};
}
