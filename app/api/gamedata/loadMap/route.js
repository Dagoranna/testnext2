import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const body = await req.json();
  const { email } = body;

  const store = await getMapsList(email);
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
