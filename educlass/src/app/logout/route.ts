import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}