'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ripple } from '@/components/ui/ripple';

export default function UnreadPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUnreadEmails() {
      try {
        const res = await fetch('/api/gmail?type=unread');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');

        setEmails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUnreadEmails();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // ✅ function to mark email as read
  const markAsRead = async (id) => {
    try {
      await fetch('/api/gmail/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      // Optimistically update UI (remove from unread list)
      setEmails((prev) => prev.filter((email) => email.id !== id));
    } catch (err) {
      console.error('Failed to mark email as read:', err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <Ripple />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Unread Emails ({emails.length})</h1>

      {emails.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No Unread emails found.
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/dashboard/inbox/unread/${email.id}`}
              className="block bg-white border rounded-lg shadow-sm overflow-hidden p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={async () => {
                await markAsRead(email.id); // 👈 mark as read before navigating
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm truncate max-w-xs">
                      {email.from?.replace(/.*<(.*)>.*/, '$1') || email.from}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDate(email.date)}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-900 truncate">
                    {email.subject}
                  </div>

                  <div className="text-xs text-gray-600 truncate mt-1">
                    {truncateText(
                      email.snippet ||
                        (email.textBody ||
                          email.htmlBody?.replace(/<[^>]*>/g, ''))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  {email.hasAttachments && (
                    <span
                      className="text-xs text-blue-600"
                      title="Has attachments"
                    >
                      📎
                    </span>
                  )}
                  {email.hasInlineImages && (
                    <span
                      className="text-xs text-green-600"
                      title="Has images"
                    >
                      🖼️
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
