'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';
import EmailNav from './emailNav';
import { Star, Archive, Trash2, MailOpen, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { decodeHtmlEntities, formatDate, extractSenderName } from '@/lib/helprEmails';
import { useEmailActions } from '@/lib/useEmailActions';
import { AutoDeleteBadge } from './warningBadge';
import { useSearch } from '@/lib/searchContext';

import { getCachedEmails, setCachedEmails } from '@/lib/emailCache';

// Client cache for full email content (prefetched on hover)
const emailDetailCache = new Map();

// Export cache getter for showEmail.jsx
export function getPrefetchedEmail(emailId) {
  return emailDetailCache.get(emailId);
}

// Export cache updater to sync changes from email detail view back to list
export function updateCachedEmailStatus(emailId, operation) {
  const cached = emailDetailCache.get(emailId);
  if (cached) {
    if (operation === 'markRead') {
      cached.labelIds = (cached.labelIds || []).filter(label => label !== 'UNREAD');
    } else if (operation === 'markUnread') {
      if (!cached.labelIds?.includes('UNREAD')) {
        cached.labelIds = [...(cached.labelIds || []), 'UNREAD'];
      }
    }
  }
}

export default function UnifiedEmailComponent({ type, subtype }) {
  const queryType = subtype || type;
  
  // Track the previous type using ref (doesn't cause re-renders)
  const prevQueryTypeRef = useRef(queryType);
  
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredEmail, setHoveredEmail] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchAbortController = useRef(null);
  
  // Search context
  const { searchResults, isSearching, isSearchActive, searchQuery, clearSearch } = useSearch();

  // Pagination handlers
  const handleNextPage = () => {
    console.log('🔜 Next page clicked');
    console.log('Current state:', {
      nextPageToken,
      currentPageToken: pageToken,
      pageHistoryLength: pageHistory.length,
      currentPage
    });
    
    if (nextPageToken) {
      setPageHistory(prev => [...prev, pageToken]);
      setPageToken(nextPageToken);
      setCurrentPage(prev => prev + 1);
      console.log('✅ Moving to next page');
    } else {
      console.log('❌ No next page token available');
    }
  };

  const handlePreviousPage = () => {
    console.log('🔙 Previous page clicked');
    console.log('Current state:', {
      pageHistoryLength: pageHistory.length,
      currentPage
    });
    
    if (pageHistory.length > 0) {
      const newHistory = [...pageHistory];
      const previousToken = newHistory.pop();
      console.log('Going back to token:', previousToken);
      setPageHistory(newHistory);
      setPageToken(previousToken);
      setCurrentPage(prev => prev - 1);
      console.log('✅ Moving to previous page');
    } else {
      console.log('❌ Already on first page');
    }
  };

  // ✅ Custom hook for all email actions
  const {
    selectedEmails,
    toggleEmailSelection,
    handleSelectAll,
    handleDeselectAll,
    markAsRead,
    deleteEmail,
    deleteSelectedEmails,
    archiveEmail,
    archiveSelectedEmails,
    markSelectedAsRead,
    markSelectedAsUnread,
  } = useEmailActions(type, subtype);

  // 🔄 Fetch emails - only runs when we need to fetch from server
  useEffect(() => {
    const currentQueryType = subtype || type;
    const typeChanged = prevQueryTypeRef.current !== currentQueryType;
    
    // Update ref for next render
    prevQueryTypeRef.current = currentQueryType;
    
    // Cancel previous request if still pending
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    fetchAbortController.current = new AbortController();

    // Reset pagination on type change
    if (typeChanged) {
      setPageToken(null);
      setPageHistory([]);
      setCurrentPage(1);
      setError(null);
    }

    // Check cache first (for first page only)
    if (!pageToken) {
      const cachedData = getCachedEmails(currentQueryType);
      if (cachedData) {
        console.log(`⚡ Client cache hit for ${currentQueryType}`);
        const emailsData = Array.isArray(cachedData) ? cachedData : (cachedData.emails || []);
        setEmails(emailsData);
        setLoading(false);
        setInitialLoad(false);
        return; // Don't fetch, use cached data
      }
    }
    
    // No cache - show loading and fetch
    setLoading(true);
    if (typeChanged) {
      setEmails([]);
      setInitialLoad(true);
    }

    async function fetchEmails() {
      try {
        console.log(`📡 Fetching from server: ${currentQueryType}, page token: ${pageToken || 'none'}`);
        const url = `/api/gmail?type=${currentQueryType}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const res = await fetch(url, {
          signal: fetchAbortController.current.signal,
          cache: 'no-store',
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');
        
        const emailsData = Array.isArray(data) ? data : (data.emails || []);
        const newNextPageToken = data.nextPageToken || null;
        
        console.log('📥 Received data:', { 
          emailCount: emailsData.length, 
          nextPageToken: newNextPageToken,
          hasNextToken: !!newNextPageToken,
          dataType: Array.isArray(data) ? 'array' : 'object'
        });
        
        // Only cache first page
        if (!pageToken) {
          setCachedEmails(currentQueryType, emailsData);
        }
        setEmails(emailsData);
        setNextPageToken(newNextPageToken);
        
        console.log('📊 State after update:', {
          emailsCount: emailsData.length,
          nextPageToken: newNextPageToken,
          willEnableNextButton: !!newNextPageToken
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    }
    
    fetchEmails();

    // Cleanup function to abort request if component unmounts
    return () => {
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
    };
  }, [type, subtype, pageToken]);

  // 🧭 Generate the correct email link
  const getEmailLink = (emailId) => {
    // For search results, use inbox as default view
    if (isSearchActive) {
      return `/dashboard/inbox/${emailId}`;
    }
    return subtype ? `/dashboard/${type}/${subtype}/${emailId}` : `/dashboard/${type}/${emailId}`;
  };

  // 🚀 Prefetch email on hover (loads full content in background)
  const prefetchEmailOnHover = async (emailId) => {
    // Skip if already cached
    if (emailDetailCache.has(emailId)) {
      return;
    }

    try {
      const res = await fetch(`/api/gmail/email/${emailId}`);
      if (res.ok) {
        const data = await res.json();
        emailDetailCache.set(emailId, data);
        console.log(`✨ Prefetched email ${emailId}`);
      }
    } catch (err) {
      console.warn(`Prefetch failed for ${emailId}:`, err);
    }
  };

  // 🔄 Refresh emails (clear cache and refetch)
  const handleRefresh = async () => {
    const queryType = subtype || type;
    
    try {
      setLoading(true);
      // Clear client cache
      const emptyMap = new Map();
      setCachedEmails(queryType, null);
      
      // Reset pagination
      setPageToken(null);
      setPageHistory([]);
      setCurrentPage(1);
      
      console.log(`🔄 Refreshing emails: ${queryType}`);
      const res = await fetch(`/api/gmail?type=${queryType}&refresh=true`, {
        // Force bypass cache
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');
      
      const emailsData = Array.isArray(data) ? data : (data.emails || []);
      
      // Cache on client
      setCachedEmails(queryType, emailsData);
      setEmails(emailsData);
      setNextPageToken(data.nextPageToken || null);
      console.log(`✓ Refresh complete`);
    } catch (err) {
      setError(err.message);
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = subtype || type;
  
  // Determine which emails to display - search results or regular emails
  const displayEmails = isSearchActive ? searchResults : emails;
  const showSearchHeader = isSearchActive;
  
  // Helper function to highlight search matches
  const highlightText = (text, query) => {
    if (!isSearchActive || !query || !text) return text;
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-500/40 px-0.5 rounded-sm">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // ❌ Error State
  if (error)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );

  // 📩 Main UI - Log pagination state before render
  const hasNextPage = !!nextPageToken;
  const hasPreviousPage = pageHistory.length > 0;
  
  console.log('🎨 Rendering with pagination state:', { 
    hasNextPage,
    hasPreviousPage,
    nextPageToken,
    pageHistoryLength: pageHistory.length,
    currentPage,
    emailsCount: emails.length
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {/* Search Header */}
      {showSearchHeader && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border-b">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Search results for "{searchQuery}"
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              ({isSearching ? 'Searching...' : `${searchResults.length} found`})
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors text-blue-600 dark:text-blue-400"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      
      {(type === 'spam' || type == 'bin' || type == 'trash') && !isSearchActive && <AutoDeleteBadge folderType={type} />}
      <EmailNav
        selectedCount={selectedEmails.size}
        totalCount={emails.length}
        onSelectAll={() => handleSelectAll(emails)}
        onDeselectAll={handleDeselectAll}
        onDelete={() => deleteSelectedEmails(setEmails)}
        onArchive={() => archiveSelectedEmails(setEmails)}
        onMarkRead={() => markSelectedAsRead(setEmails)}
        onMarkUnread={() => markSelectedAsUnread(setEmails)}
        selectedEmails={selectedEmails}
        emails={emails}
        onRefresh={handleRefresh}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />

      <div className="flex-1 overflow-auto">
        {(loading || initialLoad) && !isSearchActive ? (
          <div className="flex justify-center items-center h-full w-full">
            <Spinner className="size-8" />
          </div>
        ) : isSearching ? (
          <div className="flex justify-center items-center h-full w-full">
            <Spinner className="size-8" />
          </div>
        ) : displayEmails.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {isSearchActive ? (
              <>
                <Search className="size-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg mb-2">No emails found for "{searchQuery}"</div>
                <div className="text-sm">Try a different search term</div>
              </>
            ) : (
              <>
                <div className="text-lg mb-2">No {displayName} emails found</div>
                <div className="text-sm">Your {displayName} folder is empty</div>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-800">
            {displayEmails.map((email) => {
              const isSelected = selectedEmails.has(email.id);
              const isHovered = hoveredEmail === email.id;
              const isUnread = email.labelIds?.includes('UNREAD');

              return (
                <div
                  key={email.id}
                  className={cn(
                    'relative group transition-all duration-200',
                    isSelected
                      ? 'bg-[#C2DBFF]'
                      : isUnread
                      ? 'bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_-1px_4px_rgba(0,0,0,0.05)] hover:z-10'
                      : 'bg-[#F2F6FC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_-1px_4px_rgba(0,0,0,0.05)] hover:z-10'
                  )}
                  onMouseEnter={() => {
                    setHoveredEmail(email.id);
                    prefetchEmailOnHover(email.id);
                  }}
                  onMouseLeave={() => setHoveredEmail(null)}
                >
                  <Link
                    href={getEmailLink(email.id)}
                    className="flex items-center px-4 py-2 gap-4"
                  >
                    {/* Checkbox */}
                    <div onClick={(e) => toggleEmailSelection(email.id, e)} data-checkbox>
                      <Checkbox checked={isSelected} onChange={() => {}} />
                    </div>

                    {/* Star */}
                    <div className="flex-shrink-0">
                      <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
                    </div>

                    {/* Sender */}
                    <div className="w-48 flex-shrink-0">
                      <span
                        className={cn(
                          'text-sm truncate block',
                          isUnread ? 'font-bold text-black' : 'font-normal text-gray-700'
                        )}
                      >
                        {highlightText(decodeHtmlEntities(extractSenderName(email.from)), searchQuery)}
                      </span>
                    </div>

                    {/* Subject + Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-1">
                        <span
                          className={cn(
                            isUnread ? 'font-bold text-black' : 'font-normal text-gray-700'
                          )}
                        >
                          {highlightText(decodeHtmlEntities(email.subject) || '(no subject)', searchQuery)}
                        </span>
                        <span className="text-gray-600 ml-2">
                          - {highlightText(decodeHtmlEntities(email.previewText || email.snippet || ''), searchQuery)}
                        </span>
                      </div>
                    </div>

                    {/* Date & Hover Icons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isHovered && !isSelected && (
                        <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Archive"
                            onClick={(e) => archiveEmail(email.id, e, setEmails)}
                          >
                            <Archive className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete"
                            onClick={(e) => deleteEmail(email.id, e, setEmails)}
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Mark as read"
                            onClick={(e) => markAsRead(email.id, setEmails)}>
                            <MailOpen className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}

                      {/* Attachment */}
                      {email.hasAttachments && (
                        <div className="text-gray-500" title="Has attachments">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                          </svg>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-gray-600 w-20 text-right">
                        {formatDate(email.date)}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
