import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  id: number;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { id } = body;

  const result = await deleteMap(id);

  if (result) {
    return NextResponse.json({ result: true }, { status: 200 });
  } else {
    return NextResponse.json({ result: false }, { status: 500 });
  }
}

async function deleteMap(id: number) {
  const { error } = await supabase.from("maps").delete().eq("id", id);

  if (error) {
    console.error("Error:", error);
    return false;
  }

  return true;
}
