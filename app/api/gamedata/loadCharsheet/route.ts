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

  const store = await getCharsheet(id);

  return NextResponse.json(
    { message: store[0], getState: true },
    { status: 200 }
  );
}

async function getCharsheet(id: number) {
  const { data, error } = await supabase
    .from("charsheets")
    .select("charsheet_content")
    .eq("id", id);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data;
}
