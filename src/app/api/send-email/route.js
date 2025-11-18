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

        // 2) Parse FormData request body
        const formData = await req.formData()
        const to = formData.get('to')
        const subject = formData.get('subject')
        const message = formData.get('message')
        const cc = formData.get('cc')
        const bcc = formData.get('bcc')
        const attachmentFiles = formData.getAll('attachments')

        if (!to || !to.trim())
            return NextResponse.json({ error: "Recipient email required" }, { status: 400 })

        if (!subject || !subject.trim())
            return NextResponse.json({ error: "Subject required" }, { status: 400 })

        if (!message || !message.trim())
            return NextResponse.json({ error: "Message body empty" }, { status: 400 })

        console.log(`Preparing email to ${to} with ${attachmentFiles.length} attachments`)

        // 3) Create RFC 2822 formatted email with proper MIME structure
        const emailLines = []
        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Email headers
        emailLines.push(`To: ${to}`)
        if (cc && cc.trim()) emailLines.push(`Cc: ${cc}`)
        if (bcc && bcc.trim()) emailLines.push(`Bcc: ${bcc}`)
        emailLines.push(`Subject: ${subject}`)
        emailLines.push('MIME-Version: 1.0')
        
        if (attachmentFiles.length > 0) {
            // With attachments: multipart/mixed
            emailLines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
            emailLines.push('')
            emailLines.push(`This is a multi-part message in MIME format.`)
            emailLines.push('')
            
            // First part: the email body (could be multipart/alternative for text+html)
            const bodyBoundary = `----=_Part_Body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            emailLines.push(`--${boundary}`)
            emailLines.push(`Content-Type: multipart/alternative; boundary="${bodyBoundary}"`)
            emailLines.push('')
            
            // Plain text version
            const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
            emailLines.push(`--${bodyBoundary}`)
            emailLines.push('Content-Type: text/plain; charset="UTF-8"')
            emailLines.push('')
            emailLines.push(plainText)
            emailLines.push('')
            
            // HTML version
            emailLines.push(`--${bodyBoundary}`)
            emailLines.push('Content-Type: text/html; charset="UTF-8"')
            emailLines.push('')
            emailLines.push(message)
            emailLines.push('')
            
            emailLines.push(`--${bodyBoundary}--`)
            emailLines.push('')
            
            // Attachments
            for (const file of attachmentFiles) {
                console.log(`Processing attachment: ${file.name} (${file.type}, ${file.size} bytes)`)
                
                const buffer = await file.arrayBuffer()
                const base64Data = Buffer.from(buffer).toString('base64')
                
                const mimeType = file.type || 'application/octet-stream'
                const fileName = file.name.replace(/"/g, '\\"') // Escape quotes in filename
                
                emailLines.push(`--${boundary}`)
                emailLines.push(`Content-Type: ${mimeType}; name="${fileName}"`)
                emailLines.push(`Content-Disposition: attachment; filename="${fileName}"`)
                emailLines.push('Content-Transfer-Encoding: base64')
                emailLines.push('')
                
                // Split base64 into 76-character lines per RFC 2045
                for (let i = 0; i < base64Data.length; i += 76) {
                    emailLines.push(base64Data.substring(i, i + 76))
                }
                emailLines.push('')
            }
            
            // Closing boundary
            emailLines.push(`--${boundary}--`)
            
        } else {
            // Without attachments: simpler multipart/alternative
            emailLines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`)
            emailLines.push('')
            
            const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
            
            // Plain text part
            emailLines.push(`--${boundary}`)
            emailLines.push('Content-Type: text/plain; charset="UTF-8"')
            emailLines.push('')
            emailLines.push(plainText)
            emailLines.push('')
            
            // HTML part
            emailLines.push(`--${boundary}`)
            emailLines.push('Content-Type: text/html; charset="UTF-8"')
            emailLines.push('')
            emailLines.push(message)
            emailLines.push('')
            
            emailLines.push(`--${boundary}--`)
        }
        
        // Join with CRLF (required by RFC 2822)
        const email = emailLines.join('\r\n')
        
        // Debug: show structure
        console.log('MIME Structure (first 2000 chars):')
        console.log(email.substring(0, 2000))
        console.log(`\nTotal email size: ${email.length} bytes`)

        // 4) Base64url encode for Gmail API
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

        // 6) Send via Gmail API
        console.log('Sending email via Gmail API...')
        
        const sendResult = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMail,
            },
        })

        console.log('✓ Email sent successfully!')
        console.log('Message ID:', sendResult.data.id)
        console.log('Thread ID:', sendResult.data.threadId)

        return NextResponse.json({
            success: true,
            messageId: sendResult.data.id,
            threadId: sendResult.data.threadId,
        })

    } catch (error) {
        console.error("❌ Email sending error:", error)
        
        // Log detailed error information
        if (error.response) {
            console.error("Response status:", error.response.status)
            console.error("Response data:", JSON.stringify(error.response.data, null, 2))
        }
        
        let err = "Failed to send email"

        if (error?.message?.includes("Invalid Credentials")) {
            err = "Authentication failed. Please sign in again."
        } else if (error?.message?.includes("Invalid to header")) {
            err = "Invalid recipient email address."
        } else if (error?.response?.status === 400) {
            err = "Invalid email format. Please check your message."
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