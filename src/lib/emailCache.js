// Client-side email cache with 5 minute TTL
const clientEmailCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedEmails(type) {
  const cached = clientEmailCache.get(type);
  if (!cached) return null;
  
  // Check if cache expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    clientEmailCache.delete(type);
    return null;
  }
  
  return cached.data;
}

export function setCachedEmails(type, data) {
  clientEmailCache.set(type, {
    data,
    timestamp: Date.now()
  });
}

// Update a specific email in all cached lists
export function updateEmailInCache(emailId, operation) {
  // Update in all cached lists
  clientEmailCache.forEach((cacheEntry) => {
    if (Array.isArray(cacheEntry.data)) {
      cacheEntry.data = cacheEntry.data.map(email => {
        if (email.id !== emailId) return email;

        const labelIds = email.labelIds || [];
        let newLabelIds = [...labelIds];

        if (operation === 'markRead') {
          newLabelIds = newLabelIds.filter(label => label !== 'UNREAD');
        } else if (operation === 'markUnread') {
          if (!newLabelIds.includes('UNREAD')) {
            newLabelIds.push('UNREAD');
          }
        }

        return {
          ...email,
          labelIds: newLabelIds
        };
      });
    }
  });
}

// Prefetch function to be used on hover/interaction
export async function prefetchEmails(type) {
  // Don't fetch if already cached
  if (getCachedEmails(type)) return;

  try {
    console.log(`🔄 Prefetching ${type}...`);
    const res = await fetch(`/api/gmail?type=${type}`);
    if (res.ok) {
      const data = await res.json();
      setCachedEmails(type, data);
      console.log(`✅ Prefetched ${type}`);
    }
  } catch (error) {
    console.error(`Error prefetching ${type}:`, error);
  }
}
