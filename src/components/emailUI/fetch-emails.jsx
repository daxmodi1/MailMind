'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';
import EmailNav from './emailNav';
import { Star, Archive, Trash2, MailOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { decodeHtmlEntities, formatDate, extractSenderName } from '@/lib/helprEmails';
import { useEmailActions } from '@/lib/useEmailActions';
import { AutoDeleteBadge } from './warningBadge';

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
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredEmail, setHoveredEmail] = useState(null);
  const fetchAbortController = useRef(null);

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

  // 🔄 Fetch emails with client-side caching
  useEffect(() => {
    const queryType = subtype || type;
    
    // Cancel previous request if still pending
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    fetchAbortController.current = new AbortController();

    async function fetchEmails() {
      try {
        // Check client cache first (instant response)
        const cachedData = getCachedEmails(queryType);
        if (cachedData) {
          console.log(`⚡ Client cache hit for ${queryType}`);
          setEmails(cachedData);
          setLoading(false);
          return;
        }

        console.log(`📡 Fetching from server: ${queryType}`);
        const res = await fetch(`/api/gmail?type=${queryType}`, {
          signal: fetchAbortController.current.signal,
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');
        
        // Cache on client
        setCachedEmails(queryType, data);
        setEmails(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmails();

    // Cleanup function to abort request if component unmounts
    return () => {
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
    };
  }, [type, subtype]);

  // 🧭 Generate the correct email link
  const getEmailLink = (emailId) =>
    subtype ? `/dashboard/${type}/${subtype}/${emailId}` : `/dashboard/${type}/${emailId}`;

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

  const displayName = subtype || type;

  // 🌀 Loading State
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );

  // ❌ Error State
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );

  // 📩 Main UI
  return (
    <div className="flex flex-col h-full bg-white">
      {(type === 'spam' || type == 'bin' || type == 'trash') && <AutoDeleteBadge folderType={type} />}
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
      />

      <div className="flex-1 overflow-auto">
        {emails.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-lg mb-2">No {displayName} emails found</div>
            <div className="text-sm">Your {displayName} folder is empty</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => {
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
                        {decodeHtmlEntities(extractSenderName(email.from))}
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
                          {decodeHtmlEntities(email.subject) || '(no subject)'}
                        </span>
                        <span className="text-gray-600 ml-2">
                          - {decodeHtmlEntities(email.previewText || email.snippet || '')}
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
                          <button className="p-1 hover:bg-gray-200 rounded" title="Mark as read">
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
