
import { getNewAccessToken } from "@/services/auth/auth.services";
import { getCookie } from "@/services/auth/tokenHandler";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

const serverFetchHelper = async (
  endPoint: string,
  options: RequestInit = {}
): Promise<Response> => {

  if (!endPoint.includes("auth/refresh-token")) {
    await getNewAccessToken();
  }

  // ১. বডিতে FormData আছে কি না তা চেক করুন
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(typeof options.headers === "object" && !Array.isArray(options.headers) && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  // ২. যদি FormData না হয় এবং আগে থেকে Content-Type দেওয়া না থাকে, তবেই JSON সেট করুন
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // ✅ Attach accessToken as Authorization header
  if (!endPoint.includes("auth/refresh-token")) {
    const accessToken = await getCookie("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  // ✅ Normalize URL: prevent double slashes
  const url =
    BACKEND_API_URL.replace(/\/$/, "") +
    "/" +
    endPoint.replace(/^\/+/, "").trim();

  // ৩. Fetch request (যদি isFormData সত্য হয়, ব্রাউজার নিজে Content-Type হ্যান্ডেল করবে)
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // ✅ Optional: check if response is JSON
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response;
  }

  // If non-JSON (HTML/404) → throw error with actual text
  const text = await response.text();
  throw new Error(
    `Server returned non-JSON response: ${text.substring(0, 300)}`
  );
};

export const serverFetch = {
  get: (endPoint: string, options: RequestInit = {}) =>
    serverFetchHelper(endPoint, { ...options, method: "GET" }),
  post: (endPoint: string, options: RequestInit = {}) =>
    serverFetchHelper(endPoint, { ...options, method: "POST" }),
  patch: (endPoint: string, options: RequestInit = {}) =>
    serverFetchHelper(endPoint, { ...options, method: "PATCH" }),
  put: (endPoint: string, options: RequestInit = {}) =>
    serverFetchHelper(endPoint, { ...options, method: "PUT" }),
  delete: (endPoint: string, options: RequestInit = {}) =>
    serverFetchHelper(endPoint, { ...options, method: "DELETE" }),
};