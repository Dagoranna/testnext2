import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

interface ResetTokenData {
  resettoken: string;
  resettokentime: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, token } = body;

  const baseData = await getResetToken(email);

  if (baseData === null) {
    return NextResponse.json(
      { message: "Database error", tokenState: -1 },
      { status: 500 }
    );
  }

  if (baseData.length === 0) {
    return NextResponse.json(
      { message: "No such user", tokenState: -1 },
      { status: 200 }
    );
  } else {
    const nowTime = new Date().getTime();
    const resetTimeMS = new Date(baseData[0].resettokentime).getTime();

    if (nowTime > resetTimeMS) {
      return NextResponse.json(
        { message: "Token expired", tokenState: -1 },
        { status: 200 }
      );
    } else {
      if (decodeURIComponent(token) === baseData[0].resettoken) {
        return NextResponse.json(
          { message: "Token valid", tokenState: 1 },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Token is invalid", tokenState: -1 },
          { status: 200 }
        );
      }
    }
  }
}

async function getResetToken(email: string): Promise<ResetTokenData[]> | null {
  const { data, error } = await supabase
    .from("advancedauth")
    .select("resettoken, resettokentime")
    .eq("email", email);

  if (error) {
    console.error("Error:", error);
    return null;
  } else {
    return data;
  }
}
