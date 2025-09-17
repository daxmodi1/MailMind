'use client'
import dynamic from "next/dynamic"

const BreadCrumb = dynamic(() => import("@/components/dashboardUI/breadCrumb"), {
  ssr: false,
  loading: () => null 
})

export default function BreadcrumbWrapper() {
  return <BreadCrumb />
}