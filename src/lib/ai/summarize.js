import { ChatGroq } from "@langchain/groq"
import { PromptTemplate } from "@langchain/core/prompts"

export const summarizeChain = async (EmailMessage) => {
    // Truncate email to prevent token limit exceeded errors
    // Groq has a 12000 TPM limit, so we'll limit email content to ~3000 chars
    const maxLength = 3000
    const truncatedEmail = EmailMessage.length > maxLength 
        ? EmailMessage.substring(0, maxLength) + "\n\n[... content truncated due to length ...]"
        : EmailMessage

    const model = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.1
    })

    const prompt = PromptTemplate.fromTemplate(`
    You are an AI assistant that helps people summarize their emails into concise bullet points.
    Make content as short as possible while retaining key information.
    Summarize the following email:
    ---
    {email}
    ---
    
    Provide a brief summary with key points in bullet format.
    `)

    const chain = prompt.pipe(model)    
    const response = await chain.invoke({
        email: truncatedEmail
    })
    return response.content
}