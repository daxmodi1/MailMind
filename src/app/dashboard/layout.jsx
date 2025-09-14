import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset} from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";
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