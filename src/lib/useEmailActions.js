'use client';
import { useState } from 'react';

export function useEmailActions(type, subtype) {
  const [selectedEmails, setSelectedEmails] = useState(new Set());

  // Toggle select/deselect individual email
  const toggleEmailSelection = (emailId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedEmails(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(emailId)) newSelected.delete(emailId);
      else newSelected.add(emailId);
      return newSelected;
    });
  };

  // Select all emails
  const handleSelectAll = (emails) => {
    const allIds = new Set(emails.map(email => email.id));
    setSelectedEmails(allIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedEmails(new Set());
  };

  // Core Gmail operation handler
  const performEmailOperation = async (operation, ids, removeFromUI = false, setEmails) => {
    try {
      const res = await fetch('/api/gmail/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${operation}`);

      const idsArray = Array.isArray(ids) ? ids : [ids];

      if (removeFromUI && setEmails) {
        // Remove emails from UI (for delete/archive)
        setEmails(prev => prev.filter(email => !idsArray.includes(email.id)));
        setSelectedEmails(prev => {
          const newSelected = new Set(prev);
          idsArray.forEach(id => newSelected.delete(id));
          return newSelected;
        });
      } else if (setEmails) {
        // Update email labels in UI (for read/unread operations)
        setEmails(prev => prev.map(email => {
          if (!idsArray.includes(email.id)) return email;

          const labelIds = email.labelIds || [];
          let newLabelIds = [...labelIds];

          if (operation === 'markRead') {
            // Remove UNREAD label
            newLabelIds = newLabelIds.filter(label => label !== 'UNREAD');
          } else if (operation === 'markUnread') {
            // Add UNREAD label if not present
            if (!newLabelIds.includes('UNREAD')) {
              newLabelIds.push('UNREAD');
            }
          }

          return {
            ...email,
            labelIds: newLabelIds
          };
        }));

        // Clear selection after bulk operations
        if (Array.isArray(ids) && ids.length > 1) {
          setSelectedEmails(new Set());
        }
      }

      return data;
    } catch (err) {
      console.error(`Failed to ${operation}:`, err);
      alert(`Failed to ${operation}. Please try again.`);
      throw err;
    }
  };

  // --- Email Operations ---
  const markAsRead = async (id, setEmails) => {
    // If we're in the unread view, remove from UI after marking as read
    const removeFromUI = type === 'unread' || subtype === 'unread';
    return performEmailOperation('markRead', id, removeFromUI, setEmails);
  };

  const deleteEmail = async (id, e, setEmails) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    return performEmailOperation('delete', id, true, setEmails);
  };

  const deleteSelectedEmails = async (setEmails) => {
    if (selectedEmails.size === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedEmails.size} email(s)?`
    );
    if (!confirmDelete) return;
    return performEmailOperation('delete', Array.from(selectedEmails), true, setEmails);
  };

  const archiveEmail = async (id, e, setEmails) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    return performEmailOperation('archive', id, true, setEmails);
  };

  const archiveSelectedEmails = async (setEmails) => {
    if (selectedEmails.size === 0) return;
    return performEmailOperation('archive', Array.from(selectedEmails), true, setEmails);
  };

  const markSelectedAsRead = async (setEmails) => {
    if (selectedEmails.size === 0) return;
    // If we're in the unread view, remove from UI after marking as read
    const removeFromUI = type === 'unread' || subtype === 'unread';
    return performEmailOperation('markRead', Array.from(selectedEmails), removeFromUI, setEmails);
  };

  const markSelectedAsUnread = async (setEmails) => {
    if (selectedEmails.size === 0) return;

    return performEmailOperation('markUnread', Array.from(selectedEmails), subtype === 'done' ? true : false, setEmails);
  };

  return {
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
  };
}