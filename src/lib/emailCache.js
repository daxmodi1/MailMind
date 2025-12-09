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
  console.log(`🔄 Updating cache for email ${emailId}`);
  console.log(`📊 Current cache entries:`, Array.from(clientEmailCache.keys()));
  
  let updated = false;
  clientEmailCache.forEach((cached, type) => {
    console.log(`  Checking cache type: ${type}`);
    const emails = Array.isArray(cached.data) ? cached.data : (cached.data?.emails || []);
    console.log(`  - Found ${emails.length} emails in cache`);
    
    const emailIndex = emails.findIndex(e => e.id === emailId);
    if (emailIndex !== -1) {
      console.log(`  - Found email at index ${emailIndex}, updating...`);
      const updatedEmail = updateFn(emails[emailIndex]);
      emails[emailIndex] = updatedEmail;
      updated = true;
      console.log(`  ✓ Updated in ${type}`, updatedEmail);
    }
  });
  
  if (!updated) {
    console.log(`⚠️ Email ${emailId} not found in any cache`);
  } else {
    console.log(`✅ Cache updated for ${emailId}`);
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
    console.log(`⚡ Already cached: ${type}`);
    return;
  }

  try {
    // Skip prefetch for certain types that might not be valid
    if (!type || type === 'id' || !type.trim()) {
      console.log(`⏭️ Skipping prefetch for invalid type: ${type}`);
      return;
    }

    console.log(`🔄 Prefetching ${type}...`);
    const url = `/api/gmail?type=${encodeURIComponent(type)}`;
    console.log(`📡 Fetch URL: ${url}`);
    
    const res = await fetch(url, {
      // Don't throw on network error, just return
    });
    
    if (!res.ok) {
      console.warn(`⚠️ Prefetch returned ${res.status} for ${type}: ${res.statusText}`);
      // Not authenticated or other error - silently fail
      return;
    }
    
    const data = await res.json();
    setCachedEmails(type, data);
    console.log(`✅ Prefetched ${type} (${Array.isArray(data) ? data.length : data.emails?.length || 0} emails)`);
  } catch (error) {
    // Silently fail on network errors - prefetch is non-critical
    console.debug(`📭 Prefetch silently failed for ${type}:`, error.message);
  }
}
