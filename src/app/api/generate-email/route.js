import { getCachedSession } from "@/lib/sessionCache"
import { generateEmailChain } from "@/lib/ai/generateEmail"
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
        const { prompt } = await req.json()

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            )
        }

        // Starting email generation
        // Email generation prompt

        // Call the generate email chain
        const generatedEmail = await generateEmailChain(prompt)

        // ✓ Email generation completed

        return NextResponse.json({
            success: true,
            email: generatedEmail
        })

    } catch (error) {
        // Email generation error
        
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate email",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        )
    }
}
