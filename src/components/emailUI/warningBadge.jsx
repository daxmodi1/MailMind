import { useState } from 'react';

export function AutoDeleteBadge({ folderType }) {
  // Only show for spam and bin/trash
  if (!['spam', 'bin', 'trash'].includes(folderType?.toLowerCase())) {
    return null;
  }

  const folderName = folderType.toLowerCase() === 'bin' || folderType.toLowerCase() === 'trash' 
    ? 'Bin' 
    : 'Spam';

  const handleDeleteAll = () => {
    // You can implement the delete all functionality here
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all ${folderName.toLowerCase()} messages now?`
    );
    if (confirmDelete) {
      // Call your API to delete all messages
      // Deleting messages
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <p className="text-sm text-gray-700">
        Messages that have been in {folderName} for more than 30 days will be automatically deleted.{' '}
        <button 
          onClick={handleDeleteAll}
          className="text-blue-600 hover:text-blue-700 font-normal hover:underline"
        >
          Delete all {folderName.toLowerCase()} messages now
        </button>
      </p>
    </div>
  );
}