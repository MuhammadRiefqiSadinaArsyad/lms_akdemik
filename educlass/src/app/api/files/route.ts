import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getFile, getFileSync } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const filePath = request.nextUrl.searchParams.get("path");
  if (!filePath) return new NextResponse("Missing path", { status: 400 });

  const isMaterial = filePath.startsWith("materials/");
  const isSubmission = filePath.startsWith("submissions/");
  if (!isMaterial && !isSubmission) return new NextResponse("Forbidden", { status: 403 });

  if (isSubmission) {
    const studentId = filePath.split("/")[1];
    const isOwner = user.role === "student" && studentId === user.id;
    if (!isOwner && user.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  }

  // ponytail: Supabase Storage bila env ada, else mem sync
  const file = isSupabaseConfigured ? await getFile(filePath) : getFileSync(filePath);
  const dl = request.nextUrl.searchParams.get("dl") === "1";
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `${dl ? "attachment" : "inline"}; filename="${file.name}"`,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "private, max-age=60",
    },
  });
}