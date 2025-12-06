'use client';
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearch } from "@/lib/searchContext";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

export function SearchForm(props) {
  const { searchQuery, setSearchQuery, performSearch, clearSearch, isSearching } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        performSearch(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, setSearchQuery, performSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    clearSearch();
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <SidebarGroup className="py-4">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search by name, company, subject..."
            className="pl-8 pr-8"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <Search className={`pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none ${isSearching ? 'animate-pulse opacity-100' : 'opacity-50'}`} />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}

