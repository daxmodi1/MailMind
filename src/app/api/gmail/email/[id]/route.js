import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { createGmailClient } from "@/lib/gmailUtils";
import { parseEmailContent } from "@/app/api/gmail/route";

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
    // Use the imported parsing function
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