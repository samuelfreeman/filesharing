// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect everything except static files and public routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
