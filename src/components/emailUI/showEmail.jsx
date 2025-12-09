'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  Mail, 
  MailOpen,
  MoreVertical,
  Star,
  Reply,
  Forward
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getPrefetchedEmail, updateCachedEmailStatus } from './fetch-emails';
import { updateCachedEmail, removeCachedEmail } from '@/lib/emailCache';

// Client cache for individual emails
const emailClientCache = new Map();

export default function ShowEmailViaID({ page }) {
  const { id } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const fetchAbortController = useRef(null);

  useEffect(() => {
    const fetchAbortController = new AbortController();

    async function fetchEmail() {
      try {
        // 1️⃣ Check prefetch cache first (from hover in email list)
        const prefetched = getPrefetchedEmail(id);
        if (prefetched) {
          // Using prefetched email
          setEmail(prefetched);
          setLoading(false);
          // Mark as read AFTER showing the email
          setTimeout(() => markEmailAsReadAfterLoad(prefetched), 0);
          return;
        }

        // 2️⃣ Check client cache next
        if (emailClientCache.has(id)) {
          const cached = emailClientCache.get(id);
          setEmail(cached);
          setLoading(false);
          // Mark as read AFTER showing the email
          setTimeout(() => markEmailAsReadAfterLoad(cached), 0);
          return;
        }

        // 3️⃣ Fetch from server
        // Fetching email from server
        const res = await fetch(`/api/gmail/email/${id}`, {
          signal: fetchAbortController.signal,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch email');

        // Cache it
        emailClientCache.set(id, data);
        setEmail(data);
        // Mark as read AFTER showing the email
        setTimeout(() => markEmailAsReadAfterLoad(data), 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEmail();

    // Cleanup
    return () => {
      fetchAbortController.abort();
    };
  }, [id]);

  // Mark email as read after it loads (only if unread)
  const markEmailAsReadAfterLoad = async (emailData) => {
    // Only mark as read if it's currently unread
    if (emailData?.labelIds?.includes('UNREAD')) {
      try {
        await fetch('/api/gmail/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'markRead',
            ids: id,
          }),
        });
        
        // Update local state to reflect read status
        setEmail(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            labelIds: (prev.labelIds || []).filter(label => label !== 'UNREAD')
          };
        });

        const newLabelIds = (emailData.labelIds || []).filter(label => label !== 'UNREAD');

        // Update all cached copies
        // 1. Prefetch detail cache (from hover)
        updateCachedEmailStatus(id, 'markRead');
        
        // 2. Email client cache (individual email view)
        emailClientCache.set(id, {
          ...emailData,
          labelIds: newLabelIds
        });
        
        // 3. Main email list cache (clientEmailCache in emailCache.js)
        updateCachedEmail(id, (email) => ({
          ...email,
          labelIds: (email.labelIds || []).filter(label => label !== 'UNREAD')
        }));

        // Email marked as read and caches updated
      } catch (err) {
        // Failed to mark email as read
      }
    }
  };

  // Action handlers
  const handleBack = () => {
    router.back();
  };

  const handleArchive = async () => {
    try {
      await fetch('/api/gmail/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'archive',
          ids: id,
        }),
      });
      // Remove from cache
      removeCachedEmail(id);
      emailClientCache.delete(id);
      router.back();
    } catch (err) {
      // Failed to archive
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/gmail/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          ids: id,
        }),
      });
      // Remove from cache
      removeCachedEmail(id);
      emailClientCache.delete(id);
      router.back();
    } catch (err) {
      // Failed to delete
    }
  };

  const handleToggleRead = async () => {
    const isUnread = email?.labelIds?.includes('UNREAD');
    try {
      await fetch('/api/gmail/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: isUnread ? 'markRead' : 'markUnread',
          ids: id,
        }),
      });
      
      const newLabelIds = isUnread 
        ? (email.labelIds || []).filter(label => label !== 'UNREAD')
        : [...(email.labelIds || []), 'UNREAD'];
      
      // Update local state
      setEmail(prev => ({
        ...prev,
        labelIds: newLabelIds
      }));
      
      // Update cache with new label state
      updateCachedEmail(id, (emailData) => ({
        ...emailData,
        labelIds: newLabelIds
      }));
      
      // Update cached email in detail cache
      emailClientCache.set(id, {
        ...email,
        labelIds: newLabelIds
      });
      
      // Update the legacy cache method too
      updateCachedEmailStatus(id, isUnread ? 'markRead' : 'markUnread');
      
      // Email read status toggled and cache updated
    } catch (err) {
      // Failed to toggle read status
    }
  };

  const handleToggleStar = async () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    // TODO: Implement star API call
  };

  const handleSummarize = async () => {
    if (!email) return;
    
    setSummarizing(true);
    setSummaryError(null);
    
    try {
      const emailContent = email.htmlBody || email.textBody || '';
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: emailContent
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.premiumRequired) {
          setSummaryError('🔒 ' + data.error);
        } else {
          throw new Error(data.error || 'Failed to summarize email');
        }
        return;
      }

      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message);
      // Summarization error
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // --- Helper: rewrite links to open outside sandbox ---
  function rewriteLinks(html) {
    if (!html) return "";
    return html.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');
  }

  // --- Listen for iframe resize messages ---
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'resizeEmailIframe') {
        const iframe = document.getElementById('email-iframe');
        if (iframe) {
          iframe.style.height = event.data.height + 'px';
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner className="size-8" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Show content even while loading (progressive rendering)
  const isUnread = email?.labelIds?.includes('UNREAD');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Action Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Back to inbox"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <button
          onClick={handleArchive}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Archive"
        >
          <Archive className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={handleDelete}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Delete"
        >
          <Trash2 className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={handleToggleRead}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={isUnread ? "Mark as read" : "Mark as unread"}
        >
          {isUnread ? (
            <MailOpen className="w-5 h-5 text-gray-700" />
          ) : (
            <Mail className="w-5 h-5 text-gray-700" />
          )}
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="More"
        >
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>

        <div className="ml-auto text-sm text-gray-600">
          1 of 405
        </div>
      </div>

      {/* Email Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Email Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-normal text-gray-900">{email.subject || 'Loading...'}</h1>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleToggleStar}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title={isStarred ? "Remove star" : "Add star"}
                >
                  <Star 
                    className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                  />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Reply"
                >
                  <Reply className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Forward"
                >
                  <Forward className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Sender Info */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {email.from ? email.from.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{email.from || 'Loading...'}</div>
                    <div className="text-sm text-gray-600">to me</div>
                  </div>
                  <div className="text-sm text-gray-600">{email.date ? formatDate(email.date) : 'Loading...'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summarize Button */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? (
                <>
                  <Spinner className="size-4" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                  </svg>
                  <span>Summarise this email</span>
                </>
              )}
            </button>
          </div>

          {/* AI Summary Section - Like Gmail */}
          {summary && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.5.734v8.5c0 .41.336.75.75.75h8.5a.75.75 0 00.75-.75v-4.5a.75.75 0 011.5 0v4.5A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4.5a.75.75 0 010 1.5h-4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>AI Overview</span>
                    <span className="text-xs text-gray-600 font-normal">(by Gemini)</span>
                  </h3>
                  <div className="text-sm text-blue-900 space-y-1">
                    {summary.split('\n').filter(line => line.trim()).map((line, index) => {
                      // Handle bullet points
                      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                        return (
                          <div key={index} className="flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            <span>{line.replace(/^[•-]\s*/, '')}</span>
                          </div>
                        );
                      }
                      return <div key={index}>{line}</div>;
                    })}
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <span>By Mailmind; there may be mistakes. </span>
                    <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                  </div>
                </div>
                <button
                  onClick={() => setSummary(null)}
                  className="flex-shrink-0 text-blue-600 hover:text-blue-700 p-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {summaryError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700">
                <strong>Summary Error:</strong> {summaryError}
              </div>
            </div>
          )}

          {/* Email Content - sandboxed, auto-resizing */}
          <div className="border rounded-lg bg-white mb-6">
            {email.htmlBody ? (
              <iframe
                id="email-iframe"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body {
                          margin: 16px;
                          font-family: system-ui, -apple-system, sans-serif;
                        }
                        img {
                          max-width: 100%;
                          height: auto;
                        }
                      </style>
                    </head>
                    <body>
                      ${rewriteLinks(email.htmlBody)}
                      <script>
                        function sendHeight() {
                          const height = document.body.scrollHeight;
                          parent.postMessage({ type: 'resizeEmailIframe', height }, '*');
                        }
                        window.onload = sendHeight;
                        window.onresize = sendHeight;
                        // Some emails load images late
                        setTimeout(sendHeight, 500);
                        setTimeout(sendHeight, 1500);
                      </script>
                    </body>
                  </html>
                `}
                className="w-full border-0"
                style={{ minHeight: '500px', height: 'auto' }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                title="Email content"
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans p-4">
                {email.textBody}
              </pre>
            )}
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Attachments</h2>
              <ul className="list-disc list-inside space-y-1">
                {email.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={`/api/gmail/attachment/${email.id}/${attachment.attachmentId}?mimeType=${encodeURIComponent(
                        attachment.mimeType
                      )}&filename=${encodeURIComponent(attachment.filename)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {attachment.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
