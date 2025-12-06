'use client';
import { useSearch } from '@/lib/searchContext';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Mail, X, Search } from 'lucide-react';
import { decodeHtmlEntities, formatDate, extractSenderName } from '@/lib/helprEmails';

export function SearchResults() {
  const router = useRouter();
  const { 
    searchResults, 
    isSearching, 
    isSearchActive, 
    searchQuery,
    clearSearch 
  } = useSearch();

  // Don't show anything if search is not active
  if (!isSearchActive) {
    return null;
  }

  const handleEmailClick = (emailId) => {
    router.push(`/dashboard/inbox?emailId=${emailId}`);
  };

  return (
    <div className="absolute inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Search header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Search results for "{searchQuery}"
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="size-8" />
              <span className="ml-2 text-muted-foreground">Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Mail className="size-12 mb-4 opacity-50" />
              <p>No emails found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <ul className="divide-y">
              {searchResults.map((email) => (
                <li
                  key={email.id}
                  onClick={() => handleEmailClick(email.id)}
                  className="p-4 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">
                          {extractSenderName(email.from)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate">
                        {decodeHtmlEntities(email.subject) || '(No subject)'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {decodeHtmlEntities(email.snippet) || '(No preview)'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Results count */}
        {!isSearching && searchResults.length > 0 && (
          <div className="p-3 border-t text-center text-sm text-muted-foreground">
            Found {searchResults.length} email{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
