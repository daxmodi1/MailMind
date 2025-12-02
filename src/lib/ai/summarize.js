import { ChatGroq } from "@langchain/groq"
import { PromptTemplate } from "@langchain/core/prompts"

// Strip HTML tags and extract clean text from email content
function stripHtmlAndExtractText(html) {
    if (!html) return '';
    
    return html
        // Remove script tags and their content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Remove style tags and their content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Remove head tag and its content
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Replace br tags with newlines
        .replace(/<br\s*\/?>/gi, '\n')
        // Replace paragraph and div closings with newlines
        .replace(/<\/(p|div|tr|li)>/gi, '\n')
        // Remove all remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&[#\w]+;/g, ' ')
        // Clean up excessive whitespace while preserving paragraph breaks
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}

export const summarizeChain = async (EmailMessage) => {
    // Strip HTML tags and extract clean text
    const cleanedEmail = stripHtmlAndExtractText(EmailMessage);
    
    // Check if we have actual content after cleaning
    if (!cleanedEmail || cleanedEmail.length < 10) {
        throw new Error('Email content is empty or too short to summarize');
    }
    
    // Token limit threshold (~25k tokens ≈ ~100k characters for English text)
    // Rough estimate: 1 token ≈ 4 characters
    const maxTokens = 25000;
    const maxCharacters = maxTokens * 4; // ~100k characters
    
    // Check if content exceeds premium threshold
    if (cleanedEmail.length > maxCharacters) {
        throw new Error('PREMIUM_REQUIRED: This email is too long to summarize. Please upgrade to Premium to summarize longer emails.');
    }
    
    // Truncate to a reasonable size for the API call (3000 chars for actual processing)
    const processingLimit = 12000;
    const truncatedEmail = cleanedEmail.length > processingLimit 
        ? cleanedEmail.substring(0, processingLimit) + "\n\n[... content truncated due to length ...]"
        : cleanedEmail

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