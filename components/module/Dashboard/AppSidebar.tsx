"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter, // 👈 Footer ইম্পোর্ট করা হলো
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/auth-utils";
import { dashboardNav } from "@/lib/navItems.config";
import { logoutUser } from "@/services/auth/logoutUser";
import { LogOut } from "lucide-react"; // 👈 লগআউট আইকনের জন্য

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
// import { logoutUser } from "@/services/auth/auth.services"; // আপনার লগআউট API ফাংশন

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = dashboardNav[role];

 
  const handleLogout = async () => {
   
      
       await logoutUser(); 

     
  };

  return (
    <Sidebar className="flex flex-col h-full border-r">
      {/* 🌟 মেনু আইটেমগুলো (Content) */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-slate-900 mb-4 mt-2 px-4">
            Shilpobangla
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems?.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center gap-3">
                        {/* আইকন রেন্ডার করা */}
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 🌟 লগআউট বাটন (Footer - একেবারে নিচে থাকবে) */}
      <SidebarFooter className="p-4 border-t border-slate-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}