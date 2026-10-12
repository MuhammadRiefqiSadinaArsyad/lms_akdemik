import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("ec_session")?.value ?? "";
  const isAuthed = Boolean(session && session.length > 4);

  // butuh login
  if (!isAuthed && (pathname.startsWith("/admin") || pathname.startsWith("/student"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // pendaftaran mandiri dinonaktifkan — akun dibuatkan dosen/admin
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // sudah login jangan ke /login
  if (isAuthed && pathname === "/login") {
    // role cek ditangani di page (getSessionUser) biar Supabase UUID jalan;
    // ponytail: mock fallback tetap pakai cookie u-admin check di page
    return NextResponse.next();
  }
  // ponytail: role mismatch redirect dihapus dari middleware saat Supabase aktif;
  // page/layout akan redirect via getSessionUser() yang sudah branch Supabase vs mock
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/account", "/login", "/register"],
};