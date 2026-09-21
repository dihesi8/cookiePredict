import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthed = req.cookies.get("cp_admin")?.value === "granted";
  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin-login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};
