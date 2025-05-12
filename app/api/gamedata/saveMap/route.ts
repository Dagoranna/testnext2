import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  title: string;
  mapdata: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, title, mapdata } = body;

  const store = await getMapsList(email);
  let mapId: number | null = null;
  if (store.length !== 0) {
    mapId = store.find((item) => item.map_name === title)?.id || null;
  }

  let resSaving: boolean;

  if (mapId !== null) {
    resSaving = await updateMap(mapId, mapdata);
  } else {
    resSaving = await addMap(email, title, mapdata);
  }

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

async function addMap(email: string, title: string, mapContent: string) {
  const { error } = await supabase
    .from("maps")
    .insert([
      { author_email: email, map_name: title, map_content: mapContent },
    ]);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function updateMap(id: number, mapContent: string) {
  const { data, error } = await supabase
    .from("maps")
    .update({ map_content: mapContent })
    .eq("id", id);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getMapsList(email: string) {
  const { data, error } = await supabase
    .from("maps")
    .select("map_name, id")
    .eq("author_email", email);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data;
}
