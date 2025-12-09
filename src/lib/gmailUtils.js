import { google } from 'googleapis';

export function createGmailClient(accessToken, refreshToken) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    // Set credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Create Gmail client
    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    return gmail;
  } catch (error) {
    console.error('Error creating Gmail client:', error);
    throw new Error(`Failed to create Gmail client: ${error.message}`);
  }
}
