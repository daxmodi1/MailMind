import { NextResponse } from "next/server";
import { getCachedSession } from "@/lib/sessionCache";
import { createGmailClient } from "@/lib/gmailUtils";

// Simple in-memory cache for email metadata (2 minute TTL)
const emailCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCacheKey(userId, type) {
  return `${userId}:${type}`;
}

function getFromCache(key) {
  const cached = emailCache.get(key);
  if (!cached) return null;
  
  // Check if cache expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    emailCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key, data) {
  emailCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Export functions for cache invalidation
export function invalidateUserEmailCache(userId) {
  // Clear all caches for this user
  const keysToDelete = [];
  emailCache.forEach((value, key) => {
    if (key.startsWith(`${userId}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => emailCache.delete(key));
  console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for user ${userId}`);
}

export function invalidateEmailTypeCache(userId, type) {
  const key = getCacheKey(userId, type);
  if (emailCache.has(key)) {
    emailCache.delete(key);
    console.log(`🗑️ Invalidated cache for ${type}`);
  }
}

export async function GET(req) {
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

    const type = new URL(req.url).searchParams.get("type") || "inbox";
    const userId = session.user.id || session.user.email;
    const cacheKey = getCacheKey(userId, type);

    // Check cache first
    const cachedEmails = getFromCache(cacheKey);
    if (cachedEmails) {
      return NextResponse.json(cachedEmails, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const gmail = createGmailClient(accessToken, refreshToken);

    let emails = [];
    switch (type) {
      case "inbox":
        emails = await fetchMetadataEmails(gmail, "in:inbox");
        break;
      case "sent":
        emails = await fetchMetadataEmails(gmail, "in:sent");
        break;
      case "unread":
        emails = await fetchMetadataEmails(gmail, "in:unread");
        break;
      case "draft":
        emails = await fetchMetadataEmails(gmail, "in:draft");
        break;
      case "spam":
        emails = await fetchMetadataEmails(gmail, "in:spam");
        break;
      case "trash":
        emails = await fetchMetadataEmails(gmail, "in:trash");
        break;
      case "archive":
        emails = await fetchMetadataEmails(gmail, "in:archive");
        break;
      case "all":
        emails = await fetchMetadataEmails(gmail,  "-in:spam -in:trash");
        break;
      case "done":
        emails = await fetchMetadataEmails(gmail, "in:read");
        break;
      default:
        emails = await fetchMetadataEmails(gmail, "in:inbox");
    }

    // Store in cache
    setCache(cacheKey, emails);

    return NextResponse.json(emails, {
      headers: { 'X-Cache': 'MISS' }
    });

  } catch (error) {
    console.error("Gmail API error:", error);

    if (error.code === 401 || (error.message && error.message.includes('invalid_token'))) {
      return NextResponse.json(
        { error: "Token expired. Please re-authenticate." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

// Fetch metadata only for the email list (much faster - no full content)
async function fetchMetadataEmails(gmail, query = null, maxResults = 20) {
  try {
    // Get list of emails IDs only
    const emailList = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query || undefined,
      fields: 'messages(id)',
    });

    if (!emailList.data.messages) {
      return [];
    }

    // Fetch in batches of 10 (respect Gmail API rate limits)
    const batchSize = 10;
    const allEmails = [];
    
    for (let i = 0; i < emailList.data.messages.length; i += batchSize) {
      const batch = emailList.data.messages.slice(i, i + batchSize);
      
      const promises = batch.map(message =>
        gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          fields: 'payload/headers,snippet,labelIds,id,threadId',
        })
          .then(email => parseMetadataOnly(email.data))
          .catch(() => null)
      );

      const results = await Promise.allSettled(promises);
      const batchEmails = results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);
      
      allEmails.push(...batchEmails);
    }
    
    return allEmails;
  } catch (error) {
    console.error('Error fetching email list:', error);
    throw error;
  }
}

// Fetch read emails by filtering out unread ones (metadata only)
async function fetchReadEmails(gmail, labelIds, maxResults = 10) {
  try {
    const emailList = await gmail.users.messages.list({
      userId: 'me',
      labelIds,
      maxResults: maxResults * 2,
      fields: 'messages(id)',
    });

    if (!emailList.data.messages) {
      return [];
    }

    const batchSize = 10;
    const allEmails = [];
    
    for (let i = 0; i < emailList.data.messages.length && allEmails.length < maxResults; i += batchSize) {
      const batch = emailList.data.messages.slice(i, i + batchSize);
      
      const promises = batch.map(message =>
        gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          fields: 'payload/headers,snippet,labelIds,id,threadId',
        })
          .then(email => {
            const isUnread = email.data.labelIds?.includes('UNREAD');
            return !isUnread ? parseMetadataOnly(email.data) : null;
          })
          .catch(() => null)
      );

      const results = await Promise.allSettled(promises);
      const batchEmails = results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);
      
      allEmails.push(...batchEmails);
    }
    
    return allEmails.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching read emails:', error);
    throw error;
  }
}

// HTML Sanitization function - ADDED THIS
function sanitizeHtmlContent(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Remove all HTML tags and their content that could affect styling
  let cleaned = html
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[#\w]+;/g, ' ')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Extract clean text for preview - ADDED THIS
function extractCleanText(email) {
  // Priority order: snippet -> textBody -> cleaned htmlBody
  if (email.snippet && email.snippet.trim()) {
    return email.snippet.trim();
  }
  
  if (email.textBody && email.textBody.trim()) {
    return email.textBody.trim();
  }
  
  if (email.htmlBody) {
    return sanitizeHtmlContent(email.htmlBody);
  }
  
  return '';
}

// Parse metadata ONLY - for list view (headers + snippet, NO body content)
function parseMetadataOnly(email) {
  const headers = email.payload.headers || [];
  
  // Fast header lookup
  const headerMap = {};
  for (const h of headers) {
    if (!headerMap[h.name]) {
      headerMap[h.name] = h.value;
    }
  }
  
  return {
    id: email.id,
    threadId: email.threadId,
    subject: headerMap['Subject'] || 'No Subject',
    from: headerMap['From'] || 'Unknown Sender',
    to: headerMap['To'] || '',
    date: headerMap['Date'] || '',
    snippet: email.snippet || '',
    previewText: email.snippet || '',
    labelIds: email.labelIds || [],
    hasAttachments: false,
  };
}

// Parsing email Content - FULL content (used only when email is opened/clicked)
export function parseEmailContent(email) {
  const headers = email.payload.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
  const to = headers.find(h => h.name === 'To')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';
  
  // Parse the email body and attachments (only for full view)
  const content = parseEmailParts(email.payload);
  
  // Create clean preview text
  const emailForCleaning = {
    snippet: email.snippet || '',
    textBody: content.text,
    htmlBody: content.html
  };
  const cleanPreviewText = extractCleanText(emailForCleaning);
  
  return {
    id: email.id,
    threadId: email.threadId,
    subject,
    from,
    to,
    date,
    messageId,
    snippet: email.snippet || '',
    htmlBody: content.html,
    textBody: content.text,
    previewText: cleanPreviewText,
    attachments: content.attachments,
    inlineImages: content.inlineImages,
    hasAttachments: content.attachments.length > 0,
    hasInlineImages: content.inlineImages.length > 0,
    labelIds: email.labelIds || [],
  };
}

// Parsing the part of the emails
function parseEmailParts(payload, attachments = [], inlineImages = []) {
  let html = '';
  let text = '';
  
  // Handle multipart emails
  if (payload.parts && payload.parts.length > 0) {
    payload.parts.forEach(part => {
      const result = processPart(part, attachments, inlineImages);
      html += result.html;
      text += result.text;
    });
  } else {
    // Single part email
    const result = processPart(payload, attachments, inlineImages);
    html += result.html;
    text += result.text;
  }
  
  return { html, text, attachments, inlineImages };
}

// recursive function to make content in form of the interpretation language
function processPart(part, attachments, inlineImages) {
  let html = '';
  let text = '';
  const mimeType = part.mimeType || '';
  
  // Handle nested parts recursively
  if (part.parts && part.parts.length > 0) {
    part.parts.forEach(subPart => {
      const result = processPart(subPart, attachments, inlineImages);
      html += result.html;
      text += result.text;
    });
    return { html, text };
  }
  
  // Get headers for this part
  const headers = part.headers || [];
  const contentDisposition = headers.find(h => h.name.toLowerCase() === 'content-disposition')?.value || '';
  const contentId = headers.find(h => h.name.toLowerCase() === 'content-id')?.value || '';
  
  // Handle different content types
  if (mimeType === 'text/html' && part.body && part.body.data) {
    try {
      html = Buffer.from(part.body.data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding HTML content:', error);
    }
  } else if (mimeType === 'text/plain' && part.body && part.body.data) {
    try {
      text = Buffer.from(part.body.data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding text content:', error);
    }
  } else if (mimeType.startsWith('image/')) {
    // Handle images (both inline and attachments)
    const filename = part.filename || `image_${Date.now()}.${mimeType.split('/')[1]}`;
    const isInline = contentDisposition.toLowerCase().includes('inline') || contentId;
    
    if (part.body && part.body.data) {
      // Inline image with data
      const imageData = {
        contentId: contentId.replace(/[<>]/g, ''), // Remove < > brackets
        filename,
        mimeType,
        data: part.body.data, // base64 encoded
        size: part.body.size || 0,
        isInline,
      };
      
      if (isInline) {
        inlineImages.push(imageData);
      } else {
        attachments.push(imageData);
      }
    } else if (part.body && part.body.attachmentId) {
      // Image attachment that needs to be fetched separately
      const attachmentData = {
        filename,
        mimeType,
        attachmentId: part.body.attachmentId,
        size: part.body.size || 0,
        contentId: contentId.replace(/[<>]/g, ''),
        isInline,
      };
      
      if (isInline) {
        inlineImages.push(attachmentData);
      } else {
        attachments.push(attachmentData);
      }
    }
  } else if (part.filename && part.body && part.body.attachmentId) {
    // Handle other types of attachments
    attachments.push({
      filename: part.filename,
      mimeType,
      attachmentId: part.body.attachmentId,
      size: part.body.size || 0,
      isInline: false,
    });
  }
  
  return { html, text };
}