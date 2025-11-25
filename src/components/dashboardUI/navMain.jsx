"use client"

import { ChevronRight } from "lucide-react";
import Link from "next/link";

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
    try {
      // Extract type from /dashboard/inbox/all or /dashboard/sent or /dashboard/inbox/unread
      const parts = url.split('/').filter(Boolean); // Remove empty strings
      // parts[0] = 'dashboard', parts[1] = type, parts[2] = subtype (optional)
      if (parts.length >= 2) {
        const type = parts[1];
        const subtype = parts[2];
        const queryType = subtype || type;
        
        console.log(`📤 Prefetching from navMain:`, { url, type, subtype, queryType });
        
        if (queryType && queryType !== 'id') {
          prefetchEmails(queryType);
        }
      }
    } catch (err) {
      console.error('Error in handlePrefetch:', err);
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
                defaultOpen={false}
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
                            <Link 
                              href={subItem.url}
                              onMouseEnter={(e) => {
                                e.preventDefault?.();
                                handlePrefetch(subItem.url);
                              }}
                            >
                              <span>{subItem.title}</span>
                            </Link>
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
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link 
                  href={item.url}
                  onMouseEnter={(e) => {
                    e.preventDefault?.();
                    handlePrefetch(item.url);
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
