import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Archive = Remove INBOX label
    await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Archive email error:', error);
    return NextResponse.json(
      { error: 'Failed to archive email' },
      { status: 500 }
    );
  }
}