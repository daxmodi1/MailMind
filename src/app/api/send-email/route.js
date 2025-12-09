import { getCachedSession } from "@/lib/sessionCache"
import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        // 1) Authenticate user session
        const session = await getCachedSession(req)

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
        const isDraft = formData.get('isDraft') === 'true'
        const attachmentFiles = formData.getAll('attachments')
        
        // Log incoming data for debugging
        console.log('=== Email API Request ===')
        console.log('isDraft:', isDraft)
        console.log('to:', to || '(empty)')
        console.log('subject:', subject || '(empty)')
        console.log('message length:', message?.length || 0)
        console.log('cc:', cc || '(empty)')
        console.log('bcc:', bcc || '(empty)')
        console.log('attachments:', attachmentFiles.length)
        
        // Parse confidential mode data
        const confidentialStr = formData.get('confidential')
        let confidentialMode = null
        if (confidentialStr) {
            try {
                confidentialMode = JSON.parse(confidentialStr)
                console.log('Confidential mode enabled:', confidentialMode)
            } catch (err) {
                console.warn('Failed to parse confidential data:', err)
            }
        }

        // Validation - Different rules for drafts vs sending
        if (!isDraft) {
            // For sending: require recipient, subject, and message
            if (!to || !to.trim()) {
                console.error('❌ Validation error: Missing recipient email')
                return NextResponse.json({ error: "Recipient email required" }, { status: 400 })
            }

            if (!subject || !subject.trim()) {
                console.error('❌ Validation error: Missing subject')
                return NextResponse.json({ error: "Subject required" }, { status: 400 })
            }

            if (!message || !message.trim()) {
                console.error('❌ Validation error: Empty message')
                return NextResponse.json({ error: "Message body empty" }, { status: 400 })
            }
        }
        // For drafts: no validation required - save as-is

        // Handle Draft Save (skip Gmail sending)
        if (isDraft) {
            console.log(`Saving draft email to Gmail`)
            
            try {
                // Setup OAuth2 Client for Gmail API
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

                // Create RFC 2822 formatted email for draft
                const draftEmailLines = []
                const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                
                // Email headers
                if (to && to.trim()) draftEmailLines.push(`To: ${to}`)
                if (cc && cc.trim()) draftEmailLines.push(`Cc: ${cc}`)
                if (bcc && bcc.trim()) draftEmailLines.push(`Bcc: ${bcc}`)
                if (subject && subject.trim()) draftEmailLines.push(`Subject: ${subject}`)
                draftEmailLines.push('MIME-Version: 1.0')
                
                if (attachmentFiles.length > 0) {
                    draftEmailLines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
                    draftEmailLines.push('')
                    draftEmailLines.push(`This is a multi-part message in MIME format.`)
                    draftEmailLines.push('')
                    
                    const bodyBoundary = `----=_Part_Body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    draftEmailLines.push(`--${boundary}`)
                    draftEmailLines.push(`Content-Type: multipart/alternative; boundary="${bodyBoundary}"`)
                    draftEmailLines.push('')
                    
                    // Plain text version
                    const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                    draftEmailLines.push(`--${bodyBoundary}`)
                    draftEmailLines.push('Content-Type: text/plain; charset="UTF-8"')
                    draftEmailLines.push('')
                    draftEmailLines.push(plainText)
                    draftEmailLines.push('')
                    
                    // HTML version
                    draftEmailLines.push(`--${bodyBoundary}`)
                    draftEmailLines.push('Content-Type: text/html; charset="UTF-8"')
                    draftEmailLines.push('')
                    draftEmailLines.push(message)
                    draftEmailLines.push('')
                    
                    draftEmailLines.push(`--${bodyBoundary}--`)
                    draftEmailLines.push('')
                    
                    // Attachments
                    for (const file of attachmentFiles) {
                        console.log(`Processing attachment: ${file.name} (${file.type}, ${file.size} bytes)`)
                        
                        const buffer = await file.arrayBuffer()
                        const base64Data = Buffer.from(buffer).toString('base64')
                        
                        const mimeType = file.type || 'application/octet-stream'
                        const fileName = file.name.replace(/"/g, '\\"')
                        
                        draftEmailLines.push(`--${boundary}`)
                        draftEmailLines.push(`Content-Type: ${mimeType}; name="${fileName}"`)
                        draftEmailLines.push(`Content-Disposition: attachment; filename="${fileName}"`)
                        draftEmailLines.push('Content-Transfer-Encoding: base64')
                        draftEmailLines.push('')
                        
                        for (let i = 0; i < base64Data.length; i += 76) {
                            draftEmailLines.push(base64Data.substring(i, i + 76))
                        }
                        draftEmailLines.push('')
                    }
                    
                    draftEmailLines.push(`--${boundary}--`)
                } else {
                    // Without attachments
                    draftEmailLines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`)
                    draftEmailLines.push('')
                    
                    const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                    
                    draftEmailLines.push(`--${boundary}`)
                    draftEmailLines.push('Content-Type: text/plain; charset="UTF-8"')
                    draftEmailLines.push('')
                    draftEmailLines.push(plainText)
                    draftEmailLines.push('')
                    
                    draftEmailLines.push(`--${boundary}`)
                    draftEmailLines.push('Content-Type: text/html; charset="UTF-8"')
                    draftEmailLines.push('')
                    draftEmailLines.push(message)
                    draftEmailLines.push('')
                    
                    draftEmailLines.push(`--${boundary}--`)
                }
                
                const draftEmail = draftEmailLines.join('\r\n')
                
                const encodedDraft = Buffer.from(draftEmail)
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '')

                // Save as draft in Gmail
                console.log('Creating draft in Gmail...')
                const draftResult = await gmail.users.drafts.create({
                    userId: "me",
                    requestBody: {
                        message: {
                            raw: encodedDraft,
                        }
                    }
                })

                console.log('✓ Draft created successfully in Gmail!')
                console.log('Draft ID:', draftResult.data.id)

                return NextResponse.json({
                    success: true,
                    isDraft: true,
                    draftId: draftResult.data.id,
                    message: 'Draft saved to Gmail successfully'
                })

            } catch (error) {
                console.error("❌ Draft save error:", error)
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Failed to save draft',
                        details: process.env.NODE_ENV === "development" ? error.message : undefined,
                    },
                    { status: 500 }
                )
            }
        }        console.log(`Preparing email to ${to} with ${attachmentFiles.length} attachments`)

        // 3) Create RFC 2822 formatted email with proper MIME structure
        const emailLines = []
        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Email headers
        emailLines.push(`To: ${to}`)
        if (cc && cc.trim()) emailLines.push(`Cc: ${cc}`)
        if (bcc && bcc.trim()) emailLines.push(`Bcc: ${bcc}`)
        emailLines.push(`Subject: ${subject}`)
        emailLines.push('MIME-Version: 1.0')
        
        // Add confidential mode headers
        if (confidentialMode && confidentialMode.enabled) {
            emailLines.push(`X-Gm-Confidential: true`)
            if (confidentialMode.expiry) {
                emailLines.push(`X-Gm-Confidential-Expiry: ${confidentialMode.expiry}T23:59:59Z`)
            }
            if (confidentialMode.passcode) {
                emailLines.push(`X-Gm-Confidential-Passcode: true`)
            }
        }
        
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
        });

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