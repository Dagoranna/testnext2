import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

interface bodyRequest {
  email: string;
  title: string;
  chardata: string;
}

export async function POST(req: Request) {
  const body: bodyRequest = await req.json();
  const { email, title, chardata } = body;

  const store = await getCharsheetsList(email);

  let charsheetId: number | null = null;
  if (store.length !== 0) {
    charsheetId =
      store.find((item) => item.charsheet_name === title)?.id || null;
  }

  let resSaving: boolean;

  if (charsheetId !== null) {
    resSaving = await updateCharsheet(charsheetId, chardata);
  } else {
    resSaving = await addCharsheet(email, title, chardata);
  }

  if (resSaving) {
    return NextResponse.json(
      { message: "charsheet saved successfully", saveState: true },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "saving failed", saveState: false },
      { status: 500 }
    );
  }
}

async function addCharsheet(
  email: string,
  title: string,
  charsheetContent: string
) {
  const { error } = await supabase.from("charsheets").insert([
    {
      author_email: email,
      charsheet_name: title,
      charsheet_content: charsheetContent,
    },
  ]);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function updateCharsheet(id: number, charsheetContent: string) {
  const { data, error } = await supabase
    .from("charsheets")
    .update({ charsheet_content: charsheetContent })
    .eq("id", id);

  if (error) {
    console.error("Error:", error);
    return false;
  } else {
    return true;
  }
}

async function getCharsheetsList(email: string) {
  const { data, error } = await supabase
    .from("charsheets")
    .select("charsheet_name, id")
    .eq("author_email", email);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data;
}
