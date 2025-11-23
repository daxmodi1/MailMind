import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/sessionCache";
import { createGmailClient } from "@/lib/gmailUtils";
import { parseEmailContent } from "@/app/api/gmail/route";

// Cache individual emails (15 minute TTL)
const emailCache = new Map();
const EMAIL_CACHE_TTL = 15 * 60 * 1000;

function getEmailCacheKey(userId, emailId) {
  return `email:${userId}:${emailId}`;
}

function getFromEmailCache(key) {
  const cached = emailCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > EMAIL_CACHE_TTL) {
    emailCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setEmailCache(key, data) {
  emailCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export async function GET(req, { params }) {
  const { id } = await params;
  
  try {
    const session = await getCachedSession(req);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const refreshToken = session.refreshToken;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "No access or refresh token" }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    const cacheKey = getEmailCacheKey(userId, id);

    // Check cache first
    const cachedEmail = getFromEmailCache(cacheKey);
    if (cachedEmail) {
      return NextResponse.json(cachedEmail, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const gmail = createGmailClient(accessToken, refreshToken);
    
    // Fetch the specific email
    const email = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    // Parse content
    const emailData = parseEmailContent(email.data);
    
    // Cache it
    setEmailCache(cacheKey, emailData);
    
    return NextResponse.json(emailData, {
      headers: { 'X-Cache': 'MISS' }
    });
    
  } catch (error) {
    console.error('Detailed error fetching single email:', {
      message: error.message,
      status: error.status,
      code: error.code,
      emailId: id
    });

    // Handle specific Gmail API errors
    if (error.code === 401 || (error.message && error.message.includes('invalid_token'))) {
      return NextResponse.json(
        { error: "Token expired. Please re-authenticate." },
        { status: 401 }
      );
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to access Gmail.' 
      }, { status: 403 });
    }
    
    if (error.status === 404) {
      return NextResponse.json({ 
        error: 'Email not found.' 
      }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch email" },
      { status: 500 }
    );
  }
}