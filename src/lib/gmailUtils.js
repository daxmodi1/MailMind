import { google } from "googleapis";

export function createGmailClient(accessToken, refreshToken) {
  // setting up googleAPI for accessing the Data
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getEmailDetails(gmail, messages) {
  return await Promise.all(
    messages.map(async (message) => {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const headers = msgRes.data.payload?.headers || [];
      const fromHeader = headers.find((h) => h.name === "From");
      const subjectHeader = headers.find((h) => h.name === "Subject");

      return {
        id: message.id,
        from: fromHeader?.value || "Unknown sender",
        subject: subjectHeader?.value || "No subject",
        snippet: msgRes.data.snippet || "No preview available",
        labelIds: msgRes.data.labelIds || [],
        threadId: msgRes.data.threadId,
        payload: msgRes.data.payload,
      };
    })
  );
}

export async function fetchEmailsByQuery(gmail, query, maxResults = 30) {
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  return getEmailDetails(gmail, messages);
}

export async function fetchInboxEmails(gmail) {
  return fetchEmailsByQuery(gmail, "in:inbox");
}

export async function fetchUnreadEmails(gmail) {
  return fetchEmailsByQuery(gmail, "is:unread");
}

export async function fetchSentEmails(gmail) {
  return fetchEmailsByQuery(gmail, "in:sent");
}

export async function fetchDraftEmails(gmail) {
  return fetchEmailsByQuery(gmail, "in:drafts");
}

export async function fetchSpamEmails(gmail) {
  return fetchEmailsByQuery(gmail, "in:spam");
}

export async function fetchTrashEmails(gmail) {
  return fetchEmailsByQuery(gmail, "in:trash");
}

export async function fetchArchivedEmails(gmail) {
  return fetchEmailsByQuery(gmail, "-in:inbox -in:sent -in:drafts -in:spam -in:trash");
}
