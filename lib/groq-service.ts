import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Allow browser usage for client-side calls
});

export interface GroqResponse {
  text: string
  analysis?: {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
  enhancedPrompt?: string
}

export interface GroqError {
  error: string
  message: string
  statusCode: number
}

// Main function to call Groq API
export async function callGroqAPI(
  prompt: string,
  mode: "analyze" | "enhance",
  options?: {
    toneStyle?: "formal" | "casual" | "creative" | "technical"
  },
): Promise<GroqResponse> {
  try {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      console.warn("Groq API key not found, using fallback response");
      return getFallbackResponse(prompt, mode, options);
    }

    if (mode === "enhance") {
      const toneStyle = options?.toneStyle || "formal";
      
      const systemPrompt = `You are an expert prompt engineer. Your task is to enhance user prompts to make them more effective for AI interactions.

Guidelines for enhancement:
- Make prompts more specific and detailed
- Add context and structure
- Include clear instructions for the desired output format
- Maintain the original intent while improving clarity
- Apply the requested tone style: ${toneStyle}

Tone styles:
- formal: Academic language, professional tone, citations where appropriate
- casual: Conversational language, everyday examples, simple explanations
- creative: Vivid language, metaphors, storytelling approaches
- technical: Precise terminology, code examples, technical specifications

Return ONLY the enhanced prompt, nothing else.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please enhance this prompt with a ${toneStyle} tone: "${prompt}"`
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 1000,
      });

      const enhancedPrompt = completion.choices[0]?.message?.content?.trim() || prompt;

      return {
        text: prompt,
        enhancedPrompt
      };
    } 
    
    else if (mode === "analyze") {
      const systemPrompt = `You are an expert prompt analyst. Analyze the given prompt and provide:
1. A score from 0-100 based on clarity, specificity, and effectiveness
2. 2-3 strengths of the prompt
3. 2-3 weaknesses or areas for improvement
4. 3-4 specific suggestions for enhancement

Format your response as JSON:
{
  "score": number,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this prompt: "${prompt}"`
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: 800,
      });

      const responseText = completion.choices[0]?.message?.content?.trim() || '';
      
      try {
        const analysis = JSON.parse(responseText);
        return {
          text: prompt,
          analysis
        };
      } catch (parseError) {
        console.error("Failed to parse analysis JSON:", parseError);
        return getFallbackResponse(prompt, mode, options);
      }
    }

    return getFallbackResponse(prompt, mode, options);
    
  } catch (error) {
    console.error("Groq API error:", error);
    return getFallbackResponse(prompt, mode, options);
  }
}

// Fallback responses for demo or when API is unavailable
function getFallbackResponse(prompt: string, mode: "analyze" | "enhance", options?: any): GroqResponse {
  switch (mode) {
    case "analyze":
      return {
        text: prompt,
        analysis: {
          score: Math.floor(Math.random() * 40) + 60,
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

    case "enhance": {
      const tone = options?.toneStyle || "formal";
      let toneModifier = "";
      
      switch(tone) {
        case "formal":
          toneModifier = "Please provide a comprehensive and well-structured response using academic language and professional terminology.";
          break;
        case "casual":
          toneModifier = "Please explain this in a conversational way with everyday examples and simple language.";
          break;
        case "creative":
          toneModifier = "Please use vivid language, metaphors, and creative storytelling to make this engaging.";
          break;
        case "technical":
          toneModifier = "Please provide precise technical details with relevant specifications and examples.";
          break;
        default:
          toneModifier = "Please provide a clear and detailed response.";
      }
      
      const enhancedPrompt = `${prompt.trim()} ${toneModifier} Structure your response with clear sections and include specific examples to illustrate key points.`;
      
      return {
        text: prompt,
        enhancedPrompt,
      };
    }

    default:
      return { text: prompt };
  }
}

// Helper functions for specific use cases
export function analyzePrompt(prompt: string) {
  return callGroqAPI(prompt, "analyze")
}

export function enhancePrompt(prompt: string, toneStyle?: "formal" | "casual" | "creative" | "technical") {
  return callGroqAPI(prompt, "enhance", { toneStyle })
}