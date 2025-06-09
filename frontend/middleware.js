import { NextResponse } from "next/server";

export default function middleware(req) {
  console.log("calling secure path middleware");

  const { cookies, nextUrl } = req;
  const accessToken = cookies.get("accessToken")?.value;

  const protectedPaths = ["/reviews"];
  if (protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    if (!accessToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reviews/:path*"], // or more routes like "/dashboard/:path*", etc.
};