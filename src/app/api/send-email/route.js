import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      )
    }

    // Parse request body
    const { to, subject, message, cc, bcc } = await req.json()

    // Validate required fields
    if (!to || to.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Recipient email (to) is required" },
        { status: 400 }
      )
    }

    if (!subject || subject.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Subject is required" },
        { status: 400 }
      )
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Message body is required" },
        { status: 400 }
      )
    }

    // Build RFC 2822 email format
    const mailContent = [
      `To: ${to}`,
      cc && cc.trim() ? `Cc: ${cc}` : null,
      bcc && bcc.trim() ? `Bcc: ${bcc}` : null,
      `Subject: ${subject}`,
      `From: ${session.user?.email || "noreply@mailmind.com"}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n")

    // Encode to base64 (RFC 2822 format for Gmail API)
    const encodedMail = Buffer.from(mailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    // Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    )

    // Set credentials
    oAuth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    })

    // Create Gmail client
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client })

    // Send email
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMail,
      },
    })

    console.log("Email sent successfully:", response.data.id)

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: response.data.id,
    })

  } catch (error) {
    console.error("Email sending error:", error)

    // Specific error messages
    let errorMessage = "Failed to send email"

    if (error.message?.includes("Invalid Credentials")) {
      errorMessage = "Authentication failed. Please sign in again."
    } else if (error.message?.includes("Invalid email address")) {
      errorMessage = "Invalid recipient email address"
    } else if (error.message?.includes("daily quota")) {
      errorMessage = "Daily quota exceeded. Try again tomorrow."
    } else if (error.status === 401) {
      errorMessage = "Session expired. Please sign in again."
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.status || 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: "Email API endpoint is working",
    status: "OK",
  })
}