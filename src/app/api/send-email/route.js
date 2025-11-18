import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        // 1) Authenticate user session
        const session = await getServerSession(authOptions)

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            )
        }

        // 2) Parse request body
        const { to, subject, message, cc, bcc } = await req.json()

        if (!to || !to.trim())
            return NextResponse.json({ error: "Recipient email required" }, { status: 400 })

        if (!subject || !subject.trim())
            return NextResponse.json({ error: "Subject required" }, { status: 400 })

        if (!message || !message.trim())
            return NextResponse.json({ error: "Message body empty" }, { status: 400 })

        // 3) Create MIME email message (similar to Python's EmailMessage)
        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Build email parts
        const emailLines = []
        
        // Headers
        emailLines.push(`From: ${session.user?.email}`)
        emailLines.push(`To: ${to}`)
        if (cc && cc.trim()) emailLines.push(`Cc: ${cc}`)
        if (bcc && bcc.trim()) emailLines.push(`Bcc: ${bcc}`)
        emailLines.push(`Subject: ${subject}`)
        emailLines.push('MIME-Version: 1.0')
        emailLines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`)
        emailLines.push('') // Blank line after headers
        
        // Plain text part
        const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        emailLines.push(`--${boundary}`)
        emailLines.push('Content-Type: text/plain; charset=utf-8')
        emailLines.push('') // Blank line after part headers
        emailLines.push(plainText)
        emailLines.push('') // Blank line after content
        
        // HTML part
        emailLines.push(`--${boundary}`)
        emailLines.push('Content-Type: text/html; charset=utf-8')
        emailLines.push('') // Blank line after part headers
        emailLines.push(message)
        emailLines.push('') // Blank line after content
        
        // Closing boundary
        emailLines.push(`--${boundary}--`)
        
        // Join with CRLF (like Python's as_bytes() does)
        const email = emailLines.join('\r\n')

        console.log("=== RAW EMAIL ===")
        console.log(email)
        console.log("=== END ===")

        // 4) Base64url encode (like Python's urlsafe_b64encode)
        const encodedMail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')

        // 5) Setup OAuth2 Client
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.NEXTAUTH_URL + "/api/auth/callback/google"
        )

        oAuth2Client.setCredentials({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
        })

        const gmail = google.gmail({ version: "v1", auth: oAuth2Client })

        // 6) Send via Gmail API (same structure as Python example)
        const sendResult = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMail,
            },
        })

        return NextResponse.json({
            success: true,
            messageId: sendResult.data.id,
        })

    } catch (error) {
        console.error("Email sending error:", error)

        let err = "Failed to send email"

        if (error?.message?.includes("Invalid Credentials")) {
            err = "Authentication failed. Please sign in again."
        }

        return NextResponse.json(
            {
                success: false,
                error: err,
                details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ status: "OK", message: "Email API working" })
}