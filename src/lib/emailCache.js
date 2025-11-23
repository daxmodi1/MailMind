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
