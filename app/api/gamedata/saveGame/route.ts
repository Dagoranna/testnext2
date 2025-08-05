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

  let gameId: number | null = null;
  if (store.length !== 0) {
    gameId = store.find((item) => item.game_name === title)?.id || null;
  }

  let resSaving: boolean;

  if (gameId !== null) {
    resSaving = await updateGame(gameId, gamedata);
  } else {
    resSaving = await addGame(email, title, gamedata);
  }

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

async function addGame(email: string, title: string, gameContent: string) {
  const { error } = await supabase.from("games").insert([
    {
      author_email: email,
      game_name: title,
      game_content: gameContent,
    },
  ]);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function updateGame(id: number, gameContent: string) {
  const { data, error } = await supabase
    .from("games")
    .update({ game_content: gameContent })
    .eq("id", id);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getGamesList(email: string) {
  const { data, error } = await supabase
    .from("gamets")
    .select("game_name, id")
    .eq("author_email", email);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data;
}
