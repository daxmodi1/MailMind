import { getCachedSession } from "@/lib/sessionCache"
import { summarizeChain } from "@/lib/ai/summarize"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        // Check authentication
        const session = await getCachedSession(req)
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Parse request body
        const { emailContent } = await req.json()

        if (!emailContent) {
            return NextResponse.json(
                { error: "Email content is required" },
                { status: 400 }
            )
        }

        console.log('Starting email summarization...')
        console.log('Content length:', emailContent.length)

        // Call the summarize chain
        const summary = await summarizeChain(emailContent)

        console.log('✓ Summarization completed')
        console.log('Summary:', summary)

        return NextResponse.json({
            success: true,
            summary: summary
        })

    } catch (error) {
        console.error("❌ Summarization error:", error)
        
        // Check if this is a premium requirement error
        if (error.message && error.message.startsWith('PREMIUM_REQUIRED:')) {
            return NextResponse.json(
                {
                    success: false,
                    error: "This email is too long to summarize. Please upgrade to Premium to summarize longer emails.",
                    premiumRequired: true
                },
                { status: 403 }
            )
        }
        
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to summarize email",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        )
    }
}
