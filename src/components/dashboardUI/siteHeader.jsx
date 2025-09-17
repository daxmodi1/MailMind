import { SidebarTrigger } from "@/components/ui/sidebar"
import BreadcrumbWrapper from "@/components/dashboardUI/breadcrumbWrapper"

export default function SiteHeader() {
  return (
    <header className="flex h-15 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-5 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="size-3 text-muted" />
        <BreadcrumbWrapper />
      </div>
    </header>
  )
} 