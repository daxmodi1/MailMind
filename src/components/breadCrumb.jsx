'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function BreadCrumb() {  // Fixed spelling: BreadCurmb → BreadCrumb
  const paths = usePathname();
  const pathNames = paths.split('/').filter(path => path);

  return (
    <Breadcrumb>  {/* Use the correct top-level component */}
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/dashboard'>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathNames.length > 0 && <BreadcrumbSeparator />}

        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join('/')}`;
          const linkName = link[0].toUpperCase() + link.slice(1);
          const isLastPath = index === pathNames.length - 1;

          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {!isLastPath ? (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{linkName}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{linkName}</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {index !== pathNames.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
