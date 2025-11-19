import { ChatGroq } from "@langchain/groq"
import { PromptTemplate } from "@langchain/core/prompts"

export const generateEmailChain = async (userPrompt) => {
    const model = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
        temperature:0.1
    })

    const prompt = PromptTemplate.fromTemplate(`
    You are an AI email writing assistant. Generate a professional email based on the user's request.
    
    User's request:
    {prompt}
    
    Please generate a complete, well-formatted email that:
    - Has a proper greeting
    - Has a clear body with the main message
    - Has a professional closing
    - Is concise and clear
    
    Only return the email body text, without any additional commentary.
    `)

    const chain = prompt.pipe(model)
    
    const response = await chain.invoke({
        prompt: userPrompt
    })
    return response.content
}
