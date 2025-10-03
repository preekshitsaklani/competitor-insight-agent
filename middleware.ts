import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	// Allow access to login and register pages
	if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	if(!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/", "/dashboard", "/competitors", "/insights", "/settings"], // Apply middleware to specific routes
};