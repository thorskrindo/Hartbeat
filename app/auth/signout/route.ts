import { NextResponse, type NextRequest } from "next/server";
import { IS_DEMO } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!IS_DEMO) await (await supabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
