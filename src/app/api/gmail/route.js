import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createGmailClient } from "@/lib/gmailUtils";

export async function GET(req) {
  try {
    // current user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const refreshToken = session.refreshToken;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "No access or refresh token" }, { status: 401 });
    }

    const gmail = createGmailClient(accessToken, refreshToken);
    //all type of the emails fetching
    const type = new URL(req.url).searchParams.get("type") || "inbox";

    let emails = [];
    switch (type) {
      case "inbox":
        emails = await fetchFullEmails(gmail, ["INBOX"]);
        break;
      case "sent":
        emails = await fetchFullEmails(gmail, ["SENT"]);
        break;
      case "unread":
        emails = await fetchFullEmails(gmail, ["UNREAD"]);
        break;
      case "drafts":
        emails = await fetchFullEmails(gmail, ["DRAFT"]);
        break;
      case "spam":
        emails = await fetchFullEmails(gmail, ["SPAM"]);
        break;
      case "trash":
        emails = await fetchFullEmails(gmail, ["TRASH"]);
        break;
      case "archive":
        emails = await fetchFullEmails(gmail, ["-INBOX", "-SPAM", "-TRASH"]);
        break;
      default:
        emails = await fetchFullEmails(gmail, ["INBOX"]);
    }

    return NextResponse.json(emails);

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

// Fetching the gmails from the gmail client
async function fetchFullEmails(gmail, labelIds, maxResults = 10) {
  try {
    // Get list of emails
    const emailList = await gmail.users.messages.list({
      userId: 'me',
      labelIds,
      maxResults,
    });

    if (!emailList.data.messages) {
      return [];
    }

    const emails = [];
    
    // Fetch full content for each email
    for (const message of emailList.data.messages) {
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full', // Get complete email structure
        });
        
        const emailData = parseEmailContent(email.data);
        emails.push(emailData);
      } catch (emailError) {
        console.error(`Error fetching email ${message.id}:`, emailError);
        // Continue with other emails even if one fails
        continue;
      }
    }
    
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

// Parsing email Content
export function parseEmailContent(email) {
  const headers = email.payload.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
  const to = headers.find(h => h.name === 'To')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';
  
  // Parse the email body and attachments
  const content = parseEmailParts(email.payload);
  
  return {
    id: email.id,
    threadId: email.threadId,
    subject,
    from,
    to,
    date,
    messageId,
    snippet: email.snippet || '',
    labelIds: email.labelIds || [],
    htmlBody: content.html,
    textBody: content.text,
    attachments: content.attachments,
    inlineImages: content.inlineImages,
    hasAttachments: content.attachments.length > 0,
    hasInlineImages: content.inlineImages.length > 0,
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