import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { NextResponse } from "next/server";
import { createGmailClient } from "@/lib/gmailUtils";
export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }
    const session = await getServerSession(authOptions);
    const gmail = createGmailClient(session.accessToken, session.refreshToken);

    // Mark as read (remove UNREAD label)
    await gmail.users.messages.modify({
      userId: "me",
      id,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
