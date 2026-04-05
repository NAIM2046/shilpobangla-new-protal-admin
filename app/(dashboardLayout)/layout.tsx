import { AppSidebar } from "@/components/module/Dashboard/AppSidebar";
import Header from "@/components/module/Dashboard/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserRole } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth/getUserInfo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userInfo = await getUserInfo();
  console.log(userInfo, "........userInfo");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AppSidebar role={userInfo.role as UserRole} />

        <main className="flex flex-1 flex-col overflow-hidden">
          {/* 🌟 হেডারে ইউজারের ডেটা পাঠানো হচ্ছে */}
          <Header
            name={userInfo.name}
            email={userInfo.email}
            role={userInfo.role}
            avatar={userInfo.avatar}
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
