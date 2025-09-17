'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

function BreadcrumbContent() {
  const pathname = usePathname()

  // Handle edge cases
  if (!pathname) {
    return null
  }

  const pathSegments = pathname.split('/').filter(segment => segment.length > 0)

  // Don't render if no segments
  if (pathSegments.length === 0) {
    return null
  }

  // Function to check if a segment looks like an email ID
  const isEmailId = (segment) => {
    // Gmail message IDs are typically long alphanumeric strings
    // You can adjust this regex based on your email ID format
    return /^[a-zA-Z0-9_-]{15,}$/.test(segment)
  }

  // Function to get meaningful names for segments
  const getSegmentDisplayName = (segment, index, segments) => {
    // Handle email IDs - replace with "Email"
    if (isEmailId(segment)) {
      return "Email"
    }
    
    // Handle other special cases
    const specialNames = {
      'gmail': 'Gmail',
      'email': 'Email',
      'inbox': 'Inbox',
      'sent': 'Sent',
      'spam': 'Spam',
      'trash': 'Trash',
      'drafts': 'Drafts',
      'unread': 'Unread',
      'archive': 'Archive'
    }
    
    if (specialNames[segment.toLowerCase()]) {
      return specialNames[segment.toLowerCase()]
    }
    
    // Default formatting
    return segment
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`
          const isLast = index === pathSegments.length - 1
          const segmentName = getSegmentDisplayName(segment, index, pathSegments)

          return (
            <Fragment key={`${segment}-${index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segmentName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{segmentName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbContent