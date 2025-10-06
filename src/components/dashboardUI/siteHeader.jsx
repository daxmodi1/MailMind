'use client'
import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PenSquare } from "lucide-react"
import BreadcrumbWrapper from "@/components/dashboardUI/breadcrumbWrapper"
import WriteMessage from "@/components/emailUI/writeMessageModel"

export default function SiteHeader() {
  const [isWriteMessageOpen, setIsWriteMessageOpen] = useState(false)

  return (
    <>
      <header className="flex h-15 items-center gap-2 transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-5 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="size-3 text-muted" />
          <BreadcrumbWrapper />
          <div className="ml-auto">
            <Button
              onClick={() => setIsWriteMessageOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Write Message
            </Button>
          </div>
        </div>
      </header>

      {/* Write Message Modal */}
      <WriteMessage
        isOpen={isWriteMessageOpen}
        onToggle={() => setIsWriteMessageOpen(!isWriteMessageOpen)}
      />
    </>
  )
}