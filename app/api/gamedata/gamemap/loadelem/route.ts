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

  const elemStore = await getElemStore(email);
  const elems = elemStore[0].elem_store;

  if (elems) {
    return NextResponse.json(
      { message: elems, loadState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "loading failed", loadState: false },
      { status: 500 }
    );
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
