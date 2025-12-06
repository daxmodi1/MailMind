"use client";

import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { cn } from "@/lib/utils";

export function ContentEditable({ className, placeholder, ...props }) {
  return (
    <LexicalContentEditable
      className={cn(
        "relative block min-h-[150px] w-full resize-none px-3 py-4 text-base outline-none",
        "focus:outline-none",
        className
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div className="pointer-events-none absolute left-3 top-4 select-none text-muted-foreground">
          {placeholder}
        </div>
      }
      {...props}
    />
  );
}
