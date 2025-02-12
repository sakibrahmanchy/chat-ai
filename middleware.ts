import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // const { userId } = await auth();
    // // Redirect signed-in users from home page to dashboard
    // if (userId && !req.nextUrl.pathname.includes('/dashboard')) {
    //     const dashboardUrl = new URL("/dashboard", req.url);
    //     return NextResponse.redirect(dashboardUrl);
    // }

    // Continue with the request if no redirects
    return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};