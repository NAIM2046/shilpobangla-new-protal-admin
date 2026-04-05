// src/proxy.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { deleteCookie, getCookie } from "./services/auth/tokenHandler";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/auth-utils";
import { getUserInfo } from "./services/auth/getUserInfo";
import { getNewAccessToken } from "./services/auth/auth.services";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("Incoming request for:", pathname);

  // 1️⃣ Token refresh logic
  const tokenRefreshResult = await getNewAccessToken();
  if (tokenRefreshResult?.tokenRefreshed) {
    const url = request.nextUrl.clone();
    url.searchParams.set("tokenRefreshed", "true");
    return NextResponse.redirect(url);
  }

  // 2️⃣ Get accessToken from cookies
  const accessToken = (await getCookie("accessToken")) || null;
  let userRole: UserRole | null = null;

  if (accessToken) {
    try {
      const verifiedToken: JwtPayload | string = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      );
      if (typeof verifiedToken === "string") throw new Error("Invalid token");
      userRole = verifiedToken.role;
      console.log("Verified token role:", userRole);
    } catch (err) {
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");
      console.log("Token verification error found");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const routerOwner = getRouteOwner(pathname);
  const isAuth = isAuthRoute(pathname);

  console.log("access token", accessToken ? "Exists" : "Null");
  console.log("is auth route", isAuth);

  // 🌟 3️⃣ Check if user needs password change FIRST (৪ নম্বর ধাপের আগে)
 if (accessToken) {
    try {
      const userInfo = await getUserInfo();

      if (userInfo && userInfo.isLoggedIn) {
        // যদি পাসওয়ার্ড পরিবর্তন করা বাধ্যতামূলক হয়
        if (userInfo.needPasswordChange) {
          // ইউজার যদি অন্য কোনো পেজে থাকে, তাকে জোর করে reset-password এ পাঠাও
          if (pathname !== "/reset-password") {
            const resetPasswordUrl = new URL("/reset-password", request.url);
            resetPasswordUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(resetPasswordUrl);
          }
        } 
        
        // 🚀 নতুন লজিক: লগিন করা ইউজার যদি নিজে থেকে /reset-password পেজে আসে, তাকে বাধা দেব না!
        if (pathname === "/reset-password") {
          return NextResponse.next(); // এখানেই তাকে পেজে ঢোকার পারমিশন দিয়ে দিলাম
        }
      }
    } catch (error) {
      console.error("Error fetching user info in middleware:", error);
    }
  }

  // 4️⃣ Redirect logged-in users away from auth routes (like /login, /register)
  // 🚀 নতুন লজিক: pathname যদি /reset-password না হয়, তবেই ড্যাশবোর্ডে পাঠাও
  if (
    accessToken && 
    isAuth && 
    pathname !== "/reset-password" && 
    pathname !== "/forgot-password" // 🌟 এই শর্তটি যোগ করা হয়েছে
  ) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
    );
  }
  

  // 5️⃣ Redirect guest users to login if route is protected
  if (!accessToken && !isAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
     
    return NextResponse.redirect(loginUrl);
  }
 

  // 6️⃣ Protected common routes
  if (routerOwner === "COMMON") {
    return NextResponse.next();
  }
  

  // 7️⃣ Role-based protected routes
  const protectedRoles = ["ADMIN", "EDITOR", "REPORTER"];
  if (protectedRoles.includes(routerOwner || "")) {
    if (userRole !== routerOwner) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
  }
console.log(routerOwner ,".....................")
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};