"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Inbox, AlertCircle, FileText, Mail, Archive, Trash2, Settings, Headphones } from 'lucide-react'
import Image from "next/image"
import { NavUser } from "./navUser"
import { NavSecondary } from "./navSecondary"
import { NavMain } from "@/components/dashboardUI/navMain"
import { SearchForm } from "./searchForm"
import { cn } from "@/lib/utils"

// All email navigation items combined
const AllEmailItems = [
  {
    title: "Inbox",
    url: "/dashboard/inbox",
    icon: Inbox,
    isActive: true,
    items: [
      {
        title: "All Messages",
        url: "/dashboard/inbox/all",
      },
      {
        title: "Unread",
        url: "/dashboard/inbox/unread",
      },
      {
        title: "Done",
        url: "/dashboard/inbox/done",
      },
    ],
  },
  {
    title: "Sent",
    url: "/dashboard/sent",
    icon: Mail,
  },
  {
    title: "Drafts",
    url: "/dashboard/drafts",
    icon: FileText,
  },
  {
    title: "Spam",
    url: "/dashboard/spam",
    icon: AlertCircle,
  },
  {
    title: "Archive",
    url: "/dashboard/archive",
    icon: Archive,
  },
  {
    title: "Trash",
    url: "/dashboard/trash",
    icon: Trash2,
  },
]

const BottomItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    url: "/dashboard/help",
    icon: Headphones,
  },
]

// Logo Image
const AppSideBarHeader = ({ state }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/" className={cn(state == "expanded" ? "py-6" : "py-0")}>
            <Image src="/logo.png" alt="logo" width={36} height={36} />
            <span className="font-main font-semibold text-xl">Mailorant</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>

  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  return (
    <Sidebar variant="inset" collapsible="icon">
      {/** Header **/}
      <SidebarHeader>
        <AppSideBarHeader items={state} />
      </SidebarHeader>
      {/* Content */}
      <SidebarContent>
        {state == "expanded" && <SearchForm />}
        <NavMain items={AllEmailItems} groupLabel="Emails" />
        <NavSecondary items={BottomItems} className="mt-auto" />
      </SidebarContent>

      {state == "expanded" && <SidebarSeparator />}

      {/* Footer */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}