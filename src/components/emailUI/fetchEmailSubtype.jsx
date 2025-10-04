'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Ripple } from '@/components/ui/ripple';
import EmailNav from './emailNav';
import { Star, Archive, Trash2, MailOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

export default function FetchEmailSubType({ type, subtype }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [hoveredEmail, setHoveredEmail] = useState(null);

  useEffect(() => {
    async function fetchArchiveEmails() {
      try {
        const res = await fetch(`/api/gmail?type=${subtype}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch emails');
        setEmails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchArchiveEmails();
  }, []);

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (!text) return text;
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
  };

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

  const deleteEmail = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch('/api/gmail/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete email');

      // Remove email from UI
      setEmails(prev => prev.filter(email => email.id !== id));
      
      // Remove from selected emails if it was selected
      setSelectedEmails(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
    } catch (err) {
      console.error('Failed to delete email:', err);
      alert('Failed to delete email. Please try again.');
    }
  };

  const deleteSelectedEmails = async () => {
    if (selectedEmails.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedEmails.size} email(s)?`
    );
    
    if (!confirmDelete) return;

    try {
      const deletePromises = Array.from(selectedEmails).map(id =>
        fetch('/api/gmail/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
      );

      await Promise.all(deletePromises);

      // Remove deleted emails from UI
      setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
      setSelectedEmails(new Set());
    } catch (err) {
      console.error('Failed to delete emails:', err);
      alert('Failed to delete some emails. Please try again.');
    }
  };
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Ripple />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500 text-lg">Error: {error}</div>
    </div>
  );

  return (
    <div className='flex flex-col h-full bg-white'>
      <EmailNav
        selectedCount={selectedEmails.size}
        totalCount={emails.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onDelete={deleteSelectedEmails}
      />

      <div className="flex-1 overflow-auto">
        {emails.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-lg mb-2">No {subtype} emails found</div>
            <div className="text-sm">Your {subtype} folder is empty</div>
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
                      ? 'bg-blue-50'
                      : isUnread
                      ? 'bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_-1px_4px_rgba(0,0,0,0.05)] hover:z-10'
                      : 'bg-[#F2F6FC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_-1px_4px_rgba(0,0,0,0.05)] hover:z-10'
                  )}
                  onMouseEnter={() => setHoveredEmail(email.id)}
                  onMouseLeave={() => setHoveredEmail(null)}
                >
                  <Link
                    href={`/dashboard/${type}/${subtype}/${email.id}`}
                    className="flex items-center px-4 py-2 gap-4"
                    onClick={async () => {
                      await markAsRead(email.id);
                    }}
                  >
                    {/* Checkbox */}
                    <div onClick={(e) => toggleEmailSelection(email.id, e)}>
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
                      <div className="text-sm line-clamp-1"
                      >
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
                          <button className="p-1 hover:bg-gray-200 rounded" title="Archive">
                            <Archive className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-200 rounded" 
                            title="Delete"
                            onClick={(e) => deleteEmail(email.id, e)}
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