import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createGmailClient } from "@/lib/gmailUtils";

export async function GET(req, { params }) {
  const { id } = params;
  
  console.log('Fetching email with ID:', id);
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('No session found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = session.accessToken;
    const refreshToken = session.refreshToken;

    if (!accessToken || !refreshToken) {
      console.log('No access or refresh token');
      return NextResponse.json({ error: "No access or refresh token" }, { status: 401 });
    }

    console.log('Creating Gmail client...');
    const gmail = createGmailClient(accessToken, refreshToken);
    
    console.log('Fetching email from Gmail API...');
    // Fetch the specific email
    const email = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    console.log('Email fetched successfully, parsing content...');
    // Parse email content using the same function from your main Gmail route
    const emailData = parseEmailContent(email.data);
    
    return NextResponse.json(emailData);
    
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

// Copy the parseEmailContent function from your main Gmail route
function parseEmailContent(email) {
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