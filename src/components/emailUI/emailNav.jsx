'use client'
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import {
  ChevronLeft,
  RefreshCw,
  MoreVertical,
  Archive,
  Trash2,
  MailOpen,
  Tag,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Spinner } from '../ui/spinner';

export default function EmailNav({ selectedCount, totalCount, onSelectAll, onDeselectAll, onDelete, onArchive, onMarkRead, onMarkUnread, selectedEmails, emails, onRefresh, onNextPage, onPreviousPage, hasNextPage, hasPreviousPage }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;
  
  console.log('🔘 EmailNav rendered with pagination props:', { 
    hasNextPage, 
    hasPreviousPage,
    onNextPage: typeof onNextPage,
    onPreviousPage: typeof onPreviousPage
  });
  
  // Check if all selected emails are read (don't have UNREAD label)
  const areAllSelectedRead = () => {
    if (selectedCount === 0) return false;
    
    const selectedEmailObjects = emails.filter(email => selectedEmails.has(email.id));
    return selectedEmailObjects.every(email => !email.labelIds?.includes('UNREAD'));
  };

  const isMarkAsUnread = areAllSelectedRead();
  
  const handleCheckboxClick = () => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const getCheckboxState = () => {
    if (allSelected) return true;
    if (someSelected) return "indeterminate";
    return false;
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {/* Selection cluster */}
        <div className="flex items-center gap-1">
          <div  
            onClick={handleCheckboxClick}
            role="button"
            aria-label={allSelected || someSelected ? 'Deselect all messages' : 'Select all messages'}
            className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            title={allSelected || someSelected ? 'Deselect' : 'Select all'}
          >
            <Checkbox
              checked={getCheckboxState()}
              onCheckedChange={handleCheckboxClick}
              className="scale-90"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 bg-gray-50 hover:bg-gray-100"
              title="Selection options"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-40 py-1">
                  <button
                    onClick={() => { onSelectAll(); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  >All</button>
                  <button
                    onClick={() => { onDeselectAll(); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  >None</button>
                  <button
                    onClick={() => { setShowDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  >Read</button>
                  <button
                    onClick={() => { setShowDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                  >Unread</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected actions pill */}
        {selectedCount > 0 && (
          <div className="flex items-center h-9 rounded-xl border border-gray-200 bg-white shadow-sm px-2">
            <button
              onClick={onArchive}
              className="flex items-center gap-1 px-3 h-7 rounded-full text-sm text-gray-700 hover:bg-gray-100"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Archive</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 h-7 rounded-full text-sm text-gray-700 hover:bg-gray-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              onClick={isMarkAsUnread ? onMarkUnread : onMarkRead}
              className="flex items-center gap-1 px-3 h-7 rounded-full text-sm text-gray-700 hover:bg-gray-100"
              title={isMarkAsUnread ? 'Mark as unread' : 'Mark as read'}
            >
              <MailOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{isMarkAsUnread ? 'Unread' : 'Read'}</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              className="flex items-center gap-1 px-3 h-7 rounded-full text-sm text-gray-700 hover:bg-gray-100"
              title="Label"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Label</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              className="flex items-center gap-1 px-3 h-7 rounded-full text-sm text-gray-700 hover:bg-gray-100"
              title="More"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="hidden sm:inline">More</span>
            </button>
          </div>
        )}

        {/* Selection count */}
        {selectedCount > 0 && (
          <span className="text-xs sm:text-sm text-gray-600">{selectedCount} selected</span>
        )}

        {/* Refresh when none selected */}
        {selectedCount === 0 && (
          <button
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
            onClick={async () => {
              setIsRefreshing(true);
              try { await onRefresh?.(); } finally { setIsRefreshing(false); }
            }}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Spinner className="size-4" /> : <RefreshCw className="w-4 h-4 text-gray-600" />}
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {totalCount > 0 && (
          <span className="text-xs sm:text-sm text-gray-600">1-{totalCount}</span>
        )}
        <button 
          onClick={() => {
            console.log('Previous button clicked, hasPreviousPage:', hasPreviousPage);
            onPreviousPage?.();
          }}
          disabled={!hasPreviousPage}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" 
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button 
          onClick={() => {
            console.log('Next button clicked, hasNextPage:', hasNextPage);
            onNextPage?.();
          }}
          disabled={!hasNextPage}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed" 
          title="Next page"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}