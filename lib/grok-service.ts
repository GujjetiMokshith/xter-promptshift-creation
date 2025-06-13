// Grok API Service for prompt analysis and enhancement

// API key would typically come from environment variables
const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY || "demo-key"
const GROK_API_URL = "https://api.grok.ai/v1"

export interface GrokResponse {
  text: string
  analysis?: {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
  enhancedPrompts?: string[]
  generatedPrompts?: string[]
}

export interface GrokError {
  error: string
  message: string
  statusCode: number
}

// Main function to call Grok API
export async function callGrokAPI(
  prompt: string,
  mode: "analyze" | "enhance" | "generate",
  options?: {
    toneStyle?: "formal" | "casual" | "creative" | "technical"
    useCase?: string
    maxResults?: number
  },
): Promise<GrokResponse> {
  try {
    const payload = {
      prompt,
      mode,
      ...options,
    }

    const response = await fetch(`${GROK_API_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as GrokError
      throw new Error(errorData.message || "Failed to call Grok API")
    }

    return (await response.json()) as GrokResponse
  } catch (error) {
    console.error("Grok API error:", error)
    // Return a fallback response for demo purposes
    return getFallbackResponse(prompt, mode, options)
  }
}

// Fallback responses for demo or when API is unavailable
function getFallbackResponse(prompt: string, mode: "analyze" | "enhance" | "generate", options?: any): GrokResponse {
  switch (mode) {
    case "analyze":
      return {
        text: prompt,
        analysis: {
          score: Math.floor(Math.random() * 40) + 60, // Random score between 60-99
          strengths: ["Clear main topic", "Appropriate length", "Specific request"],
          weaknesses: ["Missing context", "No specified format", "No audience definition"],
          suggestions: [
            "Add specific examples",
            "Specify desired output format",
            "Define your target audience",
            "Include relevant constraints",
          ],
        },
      }

    case "enhance":
      return {
        text: prompt,
        enhancedPrompts: [
          `${prompt.trim()} [Include specific examples to illustrate your point. Format the response as a detailed step-by-step guide with examples for each point. Target audience: beginners in this field.]`,
          `As an expert in ${prompt.includes(" ") ? prompt.split(" ")[0] : "this field"}, ${prompt.trim()} Provide comprehensive analysis with pros and cons. Include real-world applications and case studies where relevant.`,
          `I need a detailed explanation about ${prompt.trim()}. Please structure your response with an introduction, main points with supporting evidence, and a conclusion. Use examples that would be understood by someone with basic knowledge of the subject.`,
        ],
      }

    case "generate":
      const topic = prompt.trim()
      const useCase = options?.useCase || "general"

      return {
        text: prompt,
        generatedPrompts: [
          `Create a comprehensive guide about ${topic} that includes historical context, current applications, and future trends. Format as a structured article with headings and bullet points for key takeaways.`,
          `I'm looking to understand ${topic} in depth. Please explain the core concepts, common misconceptions, and provide practical examples that demonstrate how it works in real-world scenarios.`,
          `Write a comparative analysis of different approaches to ${topic}. Highlight the strengths and weaknesses of each approach, and recommend the best option for beginners versus experienced practitioners.`,
        ],
      }
  }
}

// Helper functions for specific use cases
export function analyzePrompt(prompt: string) {
  return callGrokAPI(prompt, "analyze")
}

export function enhancePrompt(prompt: string, toneStyle?: "formal" | "casual" | "creative" | "technical") {
  return callGrokAPI(prompt, "enhance", { toneStyle })
}

export function generatePrompts(topic: string, useCase?: string, maxResults = 3) {
  return callGrokAPI(topic, "generate", { useCase, maxResults })
}
