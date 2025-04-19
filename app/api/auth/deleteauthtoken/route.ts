import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  const baseData = await deleteAuthToken(email);

  if (baseData === null) {
    return NextResponse.json(
      { message: "Database error", logoutState: -1 },
      { status: 500 }
    );
  }

  if (baseData.length === 0) {
    return NextResponse.json(
      { message: "No such email", logoutState: -1 },
      { status: 200 }
    );
  } else {
    const response = NextResponse.json(
      { message: "logout successful", logoutState: 1 },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: true,
    });
    response.cookies.set("email", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: true,
    });

    return response;
  }
}

async function deleteAuthToken(email: string) {
  const { data, error } = await supabase
    .from("advancedauth")
    .update({ authtoken: "" })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error:", error);
    return null;
  } else {
    return data;
  }
}
