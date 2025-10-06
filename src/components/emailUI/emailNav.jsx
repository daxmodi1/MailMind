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

export default function EmailNav({ selectedCount, totalCount, onSelectAll, onDeselectAll, onDelete, onArchive, onMarkRead, onMarkUnread, selectedEmails, emails, onRefresh }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;
  
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
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        {/* Select All Checkbox with Dropdown */}
        <div className="flex items-center gap-1">
          <div
            onClick={handleCheckboxClick}
            className="cursor-pointer"
          >
            <Checkbox
              checked={getCheckboxState()}
              onCheckedChange={handleCheckboxClick}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Select options"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-40">
                  <button
                    onClick={() => {
                      onSelectAll();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      onDeselectAll();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    None
                  </button>
                  <button
                    onClick={() => {
                      // Add read emails logic here
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    Read
                  </button>
                  <button
                    onClick={() => {
                      // Add unread emails logic here
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    Unread
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - shown when emails are selected */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={onArchive}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={isMarkAsUnread ? "Mark as unread" : "Mark as read"}
              onClick={isMarkAsUnread ? onMarkUnread : onMarkRead}
            >
              <MailOpen className="w-4 h-4 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Label"
            >
              <Tag className="w-4 h-4 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="More"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Selection Count */}
        {selectedCount > 0 && (
          <span className="text-sm text-gray-600">
            {selectedCount} selected
          </span>
        )}

        {/* Refresh Button - shown when no emails are selected */}
        {selectedCount === 0 && (
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Refresh"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {totalCount > 0 && (
          <span className="text-sm text-gray-600">
            1-{totalCount} of {totalCount}
          </span>
        )}
        <div>
          <ChevronLeft className="w-4 h-4 text-gray-600 cursor-pointer opacity-50" />
        </div>
        <div>
          <ChevronRight className="w-4 h-4 text-gray-600 cursor-pointer opacity-50" />
        </div>
      </div>
    </div>
  );
}