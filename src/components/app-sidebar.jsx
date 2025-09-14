"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Inbox, AlertCircle, FileText, Mail, Archive, Trash2, Settings, Headphones } from 'lucide-react'
import Image from "next/image"
import { NavUser } from "./nav-user"
import { NavSecondary } from "./nav-secondary"
import { NavMain } from "./nav-collapse"
import { SearchForm } from "./search-form"
import { cn } from "@/lib/utils"
const items = [
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
    title: "spam",
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

const item_2 = [
  {
    title: "Settings",
    url: "dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    url: "dashboard/help",
    icon: Headphones,
  },
]
const user = {
  avatar: "none",
  name: "dax"
}

const inbox = [
  {
    title: "Inbox",
    url: "/dashboard/url",
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
]
export function AppSidebar() {
  const { state } = useSidebar();
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className={cn(state == "expanded" ? "py-6":"py-0")}>
                <Image src="/logo.png" alt="logo" width={36} height={36} />
                <span className="font-main font-semibold text-xl">Mailorant</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {state == "expanded" && <SearchForm/>}
        
        <SidebarGroup>
          <SidebarGroupLabel>Emails</SidebarGroupLabel>
          <NavMain items={inbox}/>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ url, title, icon: Icon }) => {
                return (
                  <SidebarMenuItem key={title} className={title}>
                    <SidebarMenuButton asChild>
                      <Link href={url}>
                        <Icon />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavSecondary items={item_2} className="mt-auto" />
      </SidebarContent>
       {state == "expanded" && <SidebarSeparator/>}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}