
import { AppSidebar } from "@/components/dashboardUI/appSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/dashboardUI/siteHeader";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({ children }) {
  return (
    <div>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <Separator />
            {children}
          </SidebarInset>
        </SidebarProvider>
    </div>
  );
}