"use client"

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { prefetchEmails } from "@/lib/emailCache";

export function NavMain({
  items,
  groupLabel = "Platform"
}) {
  // Helper to extract type from URL
  const handlePrefetch = (url) => {
    if (!url) return;
    // Extract type from /dashboard/inbox/all or /dashboard/sent
    const parts = url.split('/');
    // Assuming url structure is /dashboard/[type] or /dashboard/[type]/[subtype]
    // parts[0] = '', parts[1] = 'dashboard', parts[2] = type
    if (parts.length >= 3) {
      const type = parts[2];
      const subtype = parts[3];
      const queryType = subtype || type;
      if (queryType) {
        prefetchEmails(queryType);
      }
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has subitems, render as collapsible
          if (item.items?.length) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive} // expand only if active
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {/* Whole parent row is the trigger */}
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a 
                              href={subItem.url}
                              onMouseEnter={() => handlePrefetch(subItem.url)}
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }
          
          // If item has no subitems, render as regular menu item
          return (
            <SidebarMenuItem key={item.title} className={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a 
                  href={item.url}
                  onMouseEnter={() => handlePrefetch(item.url)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
