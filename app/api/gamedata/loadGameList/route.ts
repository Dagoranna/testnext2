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

  const gamesList = await getGamesList(email);
  return NextResponse.json(
    { message: gamesList, getState: true },
    { status: 200 }
  );
}

async function getGamesList(email: string) {
  const { data, error } = await supabase
    .from("games")
    .select("game_name, id")
    .eq("author_email", email);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data;
}
