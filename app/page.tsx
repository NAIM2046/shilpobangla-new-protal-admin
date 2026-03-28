import { getDefaultDashboardRoute, UserRole } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUserInfo();

  // 1. If not logged in, or no role exists, go to login
  if (!user || !user.isLoggedIn || !user.role) {
    redirect("/login");
  }

  console.log("login user", user);
  // 2. Assert the type here so TypeScript is happy
  const userRole = user.role as UserRole;

  // 3. Redirect to the appropriate dashboard
  redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);

  return null;
}