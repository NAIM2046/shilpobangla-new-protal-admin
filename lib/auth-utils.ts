// src/lib/auth-utils.ts

export type UserRole = "ADMIN" | "EDITOR" | "REPORTER" | "USER";

export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

export const authRoutes = ["/login", "/register" , "/forgot-password" , "/reset-password"];

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings", "/change-password" ],
  patterns: [],
};

export const adminProtectedRoutes: RouteConfig = {
  patterns: [/^\/admin/],
  exact: [],
};

export const editorProtectedRoutes: RouteConfig = {
  patterns: [/^\/editor/],
  exact: [],
};

export const reporterProtectedRoutes: RouteConfig = {
  patterns: [/^\/reporter/],
  exact: [],
};

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((route: string) => route === pathname);
};

export const isRouteMatches = (
  pathname: string,
  routes: RouteConfig
): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern: RegExp) => pattern.test(pathname));
};

export type RouteOwner = "ADMIN" | "EDITOR" | "REPORTER" | "COMMON" | null;

export const getRouteOwner = (pathname: string): RouteOwner => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathname, editorProtectedRoutes)) {
    return "EDITOR";
  }
  if (isRouteMatches(pathname, reporterProtectedRoutes)) {
    return "REPORTER";
  }
  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

export const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "EDITOR") {
    return "/editor/dashboard";
  }
  if (role === "REPORTER") {
    return "/reporter/dashboard";
  }
  return "/"; // কেউ না হলে হোমপেজে পাঠাবে
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole
): boolean => {
  const routeOwner = getRouteOwner(redirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};