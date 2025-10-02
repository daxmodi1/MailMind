import { AppSidebar } from "@/components/dashboardUI/appSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/dashboardUI/siteHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <SiteHeader />
          <Separator />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}