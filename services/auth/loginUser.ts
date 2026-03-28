/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

import { setCookie } from "./tokenHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@/lib/auth-utils";

function parseCookieString(str: string) {
  const parts = str.split(";").map((p) => p.trim());
  const [key, value] = parts[0].split("=");

  const attributes: any = { [key]: value };

  parts.slice(1).forEach((attr) => {
    const [aKey, aVal] = attr.split("=");
    attributes[aKey] = aVal ? aVal : true;
  });

  return attributes;
}

type LoginResponse =
  | {
      success: true;
      role: UserRole;
    }
  | {
      success: false;
      message: string;
      errors?: {
        field: PropertyKey;
        message: string;
      }[];
    };

export const loginUser = async ( payload : {
  email:string ,
  password: string
}): Promise<LoginResponse> => {
  try {
    
   

    const res = await serverFetch.post("auth/login", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result?.message || "Invalid credentials",
      };
    }

    const setCookieHeader = res.headers.getSetCookie();
    //console.log("Raw Set-Cookies:", setCookieHeader);

    let accessTokenObj: any = null;
    let refreshTokenObj: any = null;

    setCookieHeader.forEach((cookieStr: string) => {
      const parsed = parseCookieString(cookieStr);
      if (parsed.accessToken) accessTokenObj = parsed;
      if (parsed.refreshToken) refreshTokenObj = parsed;
    });

    if (!accessTokenObj || !refreshTokenObj) {
      throw new Error("Tokens not found");
    }

    await setCookie("accessToken", accessTokenObj.accessToken, {
      maxAge: Number(accessTokenObj["Max-Age"]),
      httpOnly: true,
      secure: true,
      sameSite: accessTokenObj["SameSite"] || "lax",
      path: "/",
    });

    await setCookie("refreshToken", refreshTokenObj.refreshToken, {
      maxAge: Number(refreshTokenObj["Max-Age"]),
      httpOnly: true,
      secure: true,
      sameSite: refreshTokenObj["SameSite"] || "lax",
      path: "/",
    });

    const verifiedToken = jwt.verify(
      accessTokenObj.accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as JwtPayload;

    const userRole: UserRole = verifiedToken.role;

    return {
      success: true,
      role: userRole,
    };
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login Error:", error);

    return {
      success: false,
      message: "Login failed",
    };
  }
};
