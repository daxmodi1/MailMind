import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Cache sessions for 10 seconds (minimal but helps with rapid requests)
const sessionCache = new Map();
const SESSION_CACHE_TTL = 10 * 1000; // 10 seconds

function getSessionCacheKey(req) {
  // Use authorization header or cookie as key
  const auth = req.headers?.get?.('authorization') || req.headers?.authorization || '';
  const cookies = req.headers?.get?.('cookie') || req.headers?.cookie || '';
  return `${auth}:${cookies}`;
}

function getFromSessionCache(key) {
  const cached = sessionCache.get(key);
  if (!cached) return null;
  
  // Check if cache expired
  if (Date.now() - cached.timestamp > SESSION_CACHE_TTL) {
    sessionCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setSessionCache(key, data) {
  sessionCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Cached version of getServerSession
export async function getCachedSession(req) {
  const cacheKey = getSessionCacheKey(req);
  
  // Check cache first
  const cachedSession = getFromSessionCache(cacheKey);
  if (cachedSession) {
    return cachedSession;
  }
  
  // Fetch fresh session
  const session = await getServerSession(authOptions);
  
  // Cache it
  if (session) {
    setSessionCache(cacheKey, session);
  }
  
  return session;
}

// Clear cache on logout
export function clearSessionCache() {
  sessionCache.clear();
}
