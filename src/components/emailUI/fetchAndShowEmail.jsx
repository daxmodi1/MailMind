'use client'
import { useEffect, useState } from 'react';
import { Ripple } from '@/components/ui/ripple';
import EmailNav from './emailNav';
import { Star, Archive, Trash2, MailOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FetchAndShowEmail({ type }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [hoveredEmail, setHoveredEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch(`/api/gmail?type=${type}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');
        setEmails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, [type]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      else if (days < 7)
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      else if (date.getFullYear() === now.getFullYear())
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const extractSenderName = (from) => {
    const match = from?.match(/^([^<]+)</);
    return match ? match[1].trim() : from?.replace(/.*<(.*)>.*/, '$1') || from;
  };

  const toggleEmailSelection = (emailId, e) => {
    e.preventDefault();
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) newSelected.delete(emailId);
    else newSelected.add(emailId);
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    const allEmailIds = new Set(emails.map(email => email.id));
    setSelectedEmails(allEmailIds);
  };

  const handleDeselectAll = () => {
    setSelectedEmails(new Set());
  };

  const markAsRead = async (id) => {
    try {
      await fetch('/api/gmail/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      // Update UI without removing email
      setEmails(prev =>
        prev.map(email =>
          email.id === id
            ? { ...email, labelIds: (email.labelIds || []).filter(l => l !== 'UNREAD') }
            : email
        )
      );
    } catch (err) {
      console.error('Failed to mark email as read:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Ripple /></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">Error: {error}</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      <EmailNav
        selectedCount={selectedEmails.size}
        totalCount={emails.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      <div className="flex-1 overflow-auto">
        {emails.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-lg mb-2">No {type} emails found</div>
            <div className="text-sm">Your {type} folder is empty</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => {
              const isSelected = selectedEmails.has(email.id);
              const isHovered = hoveredEmail === email.id;
              const isUnread = email.labelIds?.includes('UNREAD');

              return (
                <Link
                  key={email.id}
                  href={`/dashboard/${type}/${email.id}`}
                  className={cn(
                    'relative group transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-blue-50'
                      : isUnread
                        ? 'bg-white hover:shadow-md'
                        : 'bg-[#F2F6FC] hover:shadow-md'
                  )}
                  onMouseEnter={() => setHoveredEmail(email.id)}
                  onMouseLeave={() => setHoveredEmail(null)}
                  onClick={async () => {
                    await markAsRead(email.id); // 👈 mark as read before navigating
                  }}
                >
                  <div className="flex items-center px-4 py-2 gap-4">
                    {/* Checkbox */}
                    <div onClick={(e) => toggleEmailSelection(email.id, e)}>
                      <Checkbox checked={isSelected} onChange={() => { }} />
                    </div>

                    {/* Star */}
                    <div className="flex-shrink-0">
                      <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
                    </div>

                    {/* Sender */}
                    <div className="w-48 flex-shrink-0">
                      <span className={cn('text-sm truncate block', isUnread ? 'font-bold text-black' : 'font-normal text-gray-700')}>
                        {extractSenderName(email.from)}
                      </span>
                    </div>

                    {/* Subject + Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm overflow-hidden line-clamp-1">
                        <span className={cn(isUnread ? 'font-bold text-black' : 'font-normal text-gray-700')}>
                          {email.subject || '(no subject)'}
                        </span>
                        <span className="text-gray-600 ml-2 overflow-hidden">
                          - {email.previewText || email.snippet || ''}
                        </span>
                      </div>
                    </div>

                    {/* Date & Hover Icons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isHovered && !isSelected && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Archive">
                            <Archive className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Delete">
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Mark as read" onClick={async (e) => { e.stopPropagation(); await markAsRead(email.id); }}>
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
