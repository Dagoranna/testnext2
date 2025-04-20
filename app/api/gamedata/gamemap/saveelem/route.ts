import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  elem: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, elem } = body;

  const elemStore = await getElemStore(email);
  const elems = elemStore[0].elem_store;
  let parsedStore: string[] = [];

  if (elems) {
    parsedStore = JSON.parse(elems);
  }

  parsedStore.push(elem);

  const newStore = JSON.stringify(parsedStore);
  let resSaving = await setElemStore(email, newStore);

  if (resSaving) {
    return NextResponse.json(
      { message: "elem saved successfully", saveState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "saving failed", saveState: false },
      { status: 500 }
    );
  }
}

async function setElemStore(email: string, store: string) {
  const { data, error } = await supabase
    .from("players")
    .update({ elem_store: store })
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getElemStore(email: string) {
  const { data, error } = await supabase
    .from("players")
    .select("elem_store")
    .eq("gamer_mail", email);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return data;
  }
}
