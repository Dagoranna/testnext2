import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
);

interface bodyRequest {
  id: number;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { id } = body;

  const delCharsheet = await deleteCharsheet(id);
  if (delCharsheet) {
    return NextResponse.json(
      { message: "charsheet deleted successfully", delState: true },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { message: "charsheet was not deleted", delState: false },
      { status: 500 },
    );
  }
}

async function deleteCharsheet(id: number) {
  const { error } = await supabase.from("charsheets").delete().eq("id", id);

  if (error) {
    console.error("Error:", error);
    return false;
  }

  return true;
}
