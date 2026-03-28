// @/services/auth/getUserInfo.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandler";
import { UserRole } from "@/lib/auth-utils";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isLoggedIn: boolean;
  avatar?: string;
  needPasswordChange: boolean;
}

export const getUserInfo = async (): Promise<AuthUser> => {
  // 🌟 একটি ডিফল্ট Guest অবজেক্ট আগে থেকেই বানিয়ে রাখলাম
  const defaultGuestUser: AuthUser = {
    id: "",
    name: "Guest",
    email: "",
    role: "USER", // আপনার ডিফল্ট রোল
    isLoggedIn: false,
    avatar: "",
    needPasswordChange: false,
  };

  try {
    // ১. প্রথমেই চেক করব টোকেন আছে কি না
    const accessToken = await getCookie("accessToken");
    
    // টোকেন না থাকলে Error থ্রো না করে সরাসরি Guest রিটার্ন করব
    if (!accessToken) return defaultGuestUser;

    // ২. টোকেন থাকলে API কল করব
    const response = await serverFetch.get("auth/me");
    const result = await response.json();

    if (result.success) {
      const verifiedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;

      return {
        id: verifiedToken.userId,
        email: result.data.email,
        name: result.data.name || "Unknown User",
        role: verifiedToken.role as UserRole,
        isLoggedIn: true,
        avatar: result.data.avatar,
        needPasswordChange: result.data.needPasswordChange || false,
      };
    }

    // ৩. যদি API থেকে success false আসে, তাহলেও Guest রিটার্ন করব
    return defaultGuestUser;

  } catch (error: any) {
    // শুধুমাত্র আসল কোনো নেটওয়ার্ক বা সার্ভার এরর হলে এখানে আসবে
    // কনসোল লগটাকে ক্লিন রাখার জন্য শুধু মেসেজ প্রিন্ট করতে পারি
    console.log("Auth Check:", error?.message || "Failed to fetch user");
    
    return defaultGuestUser;
  }
};