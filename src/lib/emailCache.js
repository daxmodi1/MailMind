// Client-side email cache with 2 minute TTL
const clientEmailCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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

// Update specific emails in all caches when operations are performed
export function updateCachedEmail(emailId, updateFn) {
  // Updating cache for email
  // Current cache entries updated
  
  let updated = false;
  clientEmailCache.forEach((cached, type) => {
    // Checking cache type
    const emails = Array.isArray(cached.data) ? cached.data : (cached.data?.emails || []);
    // Found emails in cache
    
    const emailIndex = emails.findIndex(e => e.id === emailId);
    if (emailIndex !== -1) {
      // Found email, updating
      const updatedEmail = updateFn(emails[emailIndex]);
      emails[emailIndex] = updatedEmail;
      updated = true;
      // Updated in cache
    }
  });
  
  if (!updated) {
    // Email not found in any cache
  } else {
    // Cache updated successfully
  }
}

// Remove specific emails from all caches (for delete/archive operations)
export function removeCachedEmail(emailId) {
  clientEmailCache.forEach((cached, type) => {
    const emails = Array.isArray(cached.data) ? cached.data : (cached.data?.emails || []);
    const filtered = emails.filter(email => email.id !== emailId);
    
    // Update the cache with filtered data
    if (Array.isArray(cached.data)) {
      cached.data = filtered;
    } else if (cached.data?.emails) {
      cached.data.emails = filtered;
    }
  });
}

// Prefetch function to be used on hover/interaction
export async function prefetchEmails(type) {
  // Don't fetch if already cached
  if (getCachedEmails(type)) {
    // Already cached
    return;
  }

  try {
    // Skip prefetch for certain types that might not be valid
    if (!type || type === 'id' || !type.trim()) {
      // Skipping prefetch for invalid type
      return;
    }

    // Prefetching data
    const url = `/api/gmail?type=${encodeURIComponent(type)}`;
    // Fetching from URL
    
    const res = await fetch(url, {
      // Don't throw on network error, just return
    });
    
    if (!res.ok) {
      // Prefetch returned error status
      // Not authenticated or other error - silently fail
      return;
    }
    
    const data = await res.json();
    setCachedEmails(type, data);
    // Prefetched successfully
  } catch (error) {
    // Silently fail on network errors - prefetch is non-critical
    // Prefetch silently failed
  }
}
