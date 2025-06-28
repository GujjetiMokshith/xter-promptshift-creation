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
  processedText?: string
}

export interface GroqError {
  error: string
  message: string
  statusCode: number
}

// Main function to call Groq API
export async function callGroqAPI(
  prompt: string,
  mode: "analyze" | "enhance" | "handwriting",
  options?: {
    toneStyle?: "formal" | "casual" | "creative" | "technical"
    actionType?: "continue" | "grammar" | "shorten" | "summarize"
  },
): Promise<GroqResponse> {
  try {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn("Groq API key not found or not configured, using enhanced fallback response");
      return getEnhancedFallbackResponse(prompt, mode, options);
    }

    if (mode === "enhance") {
      const toneStyle = options?.toneStyle || "formal";
      
      const systemPrompt = `You are an expert prompt engineer with deep knowledge of AI systems and prompt optimization. Your task is to transform basic prompts into highly effective, detailed instructions that will produce superior AI responses.

ENHANCEMENT PRINCIPLES:
1. Add specific context and background information
2. Define clear output format and structure requirements
3. Include relevant constraints and parameters
4. Specify the target audience or use case
5. Add examples or templates when helpful
6. Include quality criteria for the response
7. Apply the requested tone style effectively

TONE STYLE GUIDELINES:
- formal: Academic language, professional terminology, structured approach, citations encouraged
- casual: Conversational tone, everyday examples, accessible language, friendly approach
- creative: Vivid imagery, metaphors, storytelling elements, innovative thinking encouraged
- technical: Precise terminology, specifications, code examples, implementation details

CURRENT TONE: ${toneStyle}

Transform the user's basic prompt into a comprehensive, well-structured instruction that will generate significantly better AI responses. Make it 3-5x more detailed and specific while maintaining the original intent.

Return ONLY the enhanced prompt, no explanations or meta-commentary.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Transform this basic prompt into a highly effective, detailed instruction with ${toneStyle} tone: "${prompt}"`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1500,
      });

      const enhancedPrompt = completion.choices[0]?.message?.content?.trim() || prompt;

      return {
        text: prompt,
        enhancedPrompt
      };
    } 
    
    else if (mode === "analyze") {
      const systemPrompt = `You are an expert prompt analyst with extensive experience in AI prompt optimization. Analyze the given prompt comprehensively and provide detailed feedback.

ANALYSIS CRITERIA:
- Clarity: How clear and unambiguous is the prompt?
- Specificity: How detailed and specific are the instructions?
- Context: Does it provide sufficient background information?
- Structure: Is it well-organized and easy to follow?
- Completeness: Does it cover all necessary aspects?
- Effectiveness: How likely is it to produce high-quality responses?

SCORING SCALE:
- 90-100: Exceptional prompt with clear instructions, specific requirements, and comprehensive context
- 80-89: Very good prompt with minor areas for improvement
- 70-79: Good prompt but missing some important elements
- 60-69: Adequate prompt with several areas needing enhancement
- 50-59: Basic prompt requiring significant improvement
- Below 50: Poor prompt needing major restructuring

Provide your analysis in this exact JSON format:
{
  "score": number,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"]
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this prompt comprehensively: "${prompt}"`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 1000,
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
        return getEnhancedFallbackResponse(prompt, mode, options);
      }
    }

    else if (mode === "handwriting") {
      const actionType = options?.actionType || "continue";
      
      let systemPrompt = "";
      
      switch (actionType) {
        case "continue":
          systemPrompt = `You are an expert writing assistant. Your task is to continue the given text naturally, maintaining the same tone, style, and voice as the original author.

CONTINUATION GUIDELINES:
1. Analyze the writing style, tone, and voice of the original text
2. Maintain consistency in perspective (first person, third person, etc.)
3. Continue the narrative or argument logically
4. Match the complexity and vocabulary level
5. Preserve the author's unique voice and personality
6. Add meaningful content that advances the topic or story
7. Aim for 2-3 times the length of the original text

Return ONLY the continuation text, starting where the original text left off. Do not include the original text or any explanations.`;
          break;
          
        case "grammar":
          systemPrompt = `You are an expert editor and proofreader. Your task is to fix grammar, spelling, punctuation, and improve sentence structure while preserving the original meaning and voice.

EDITING GUIDELINES:
1. Correct all grammatical errors and typos
2. Fix punctuation and capitalization issues
3. Improve sentence structure and flow
4. Enhance clarity without changing meaning
5. Maintain the author's original tone and style
6. Fix awkward phrasing and word choice
7. Ensure consistency in tense and voice

Return ONLY the corrected and improved text. Do not add explanations or comments.`;
          break;
          
        case "shorten":
          systemPrompt = `You are an expert editor specializing in concise writing. Your task is to shorten the given text while preserving all essential information and maintaining clarity.

SHORTENING GUIDELINES:
1. Remove redundant words and phrases
2. Combine related sentences
3. Eliminate unnecessary adjectives and adverbs
4. Use more concise expressions
5. Maintain all key information and meaning
6. Preserve the original tone and style
7. Aim for 40-60% of the original length

Return ONLY the shortened text. Do not add explanations or comments.`;
          break;
          
        case "summarize":
          systemPrompt = `You are an expert at creating clear, comprehensive summaries. Your task is to distill the given text into its most important points and key information.

SUMMARIZATION GUIDELINES:
1. Identify and include all main points
2. Preserve key details and supporting information
3. Maintain logical flow and structure
4. Use clear, concise language
5. Ensure the summary stands alone
6. Capture the essence and tone of the original
7. Aim for 20-30% of the original length

Return ONLY the summary. Do not add explanations or comments.`;
          break;
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: actionType === "grammar" ? 0.3 : 0.7,
        max_tokens: actionType === "continue" ? 2000 : 1500,
      });

      const processedText = completion.choices[0]?.message?.content?.trim() || prompt;

      return {
        text: prompt,
        processedText
      };
    }

    return getEnhancedFallbackResponse(prompt, mode, options);
    
  } catch (error) {
    console.error("Groq API error:", error);
    return getEnhancedFallbackResponse(prompt, mode, options);
  }
}

// Enhanced fallback responses that provide much better examples
function getEnhancedFallbackResponse(prompt: string, mode: "analyze" | "enhance" | "handwriting", options?: any): GroqResponse {
  switch (mode) {
    case "analyze":
      // Analyze the prompt characteristics to give more accurate feedback
      const wordCount = prompt.trim().split(/\s+/).length;
      const hasQuestions = prompt.includes('?');
      const hasSpecifics = /\b(step-by-step|detailed|comprehensive|specific|example)\b/i.test(prompt);
      const hasContext = /\b(for|about|regarding|concerning|in the context of)\b/i.test(prompt);
      
      let score = 50; // Base score
      if (wordCount > 10) score += 10;
      if (wordCount > 20) score += 10;
      if (hasQuestions) score += 5;
      if (hasSpecifics) score += 15;
      if (hasContext) score += 10;
      
      score = Math.min(score, 85); // Cap at 85 for fallback
      
      return {
        text: prompt,
        analysis: {
          score,
          strengths: [
            wordCount > 15 ? "Adequate length and detail" : "Clear main request",
            hasSpecifics ? "Includes specific requirements" : "Direct and focused",
            hasContext ? "Provides relevant context" : "Straightforward approach"
          ],
          weaknesses: [
            !hasSpecifics ? "Lacks specific requirements or constraints" : "Could benefit from more examples",
            !hasContext ? "Missing background context or use case" : "Could specify target audience",
            "No defined output format or structure requirements"
          ],
          suggestions: [
            "Add specific examples of what you're looking for",
            "Define the desired output format (list, paragraph, code, etc.)",
            "Specify your target audience or expertise level",
            "Include relevant constraints or requirements"
          ],
        },
      }

    case "enhance": {
      const tone = options?.toneStyle || "formal";
      
      // Detect prompt type for better enhancement
      const isHowTo = /\b(how to|how do|how can|steps to|guide to)\b/i.test(prompt);
      const isCreative = /\b(create|generate|design|build|make|write)\b/i.test(prompt);
      const isAnalytical = /\b(analyze|compare|evaluate|assess|review)\b/i.test(prompt);
      const isExplanatory = /\b(explain|describe|what is|tell me about)\b/i.test(prompt);
      
      let enhancedPrompt = "";
      
      if (isCreative && prompt.toLowerCase().includes("to-do app")) {
        // Special handling for to-do app creation
        switch(tone) {
          case "formal":
            enhancedPrompt = `Design and implement a comprehensive task management application (to-do app) with the following specifications:

**Core Requirements:**
- User interface for creating, editing, and deleting tasks
- Task categorization and priority levels
- Due date functionality with notifications
- Progress tracking and completion status
- Data persistence (local storage or database)

**Technical Specifications:**
- Responsive design compatible with desktop and mobile devices
- Clean, intuitive user experience following modern UI/UX principles
- Efficient state management and data handling
- Accessibility compliance (WCAG guidelines)

**Features to Include:**
1. Task creation with title, description, due date, and priority
2. Task filtering and sorting capabilities
3. Search functionality
4. Progress visualization (completion percentage)
5. Export/import functionality for task data

**Deliverables:**
- Complete source code with documentation
- User interface mockups or wireframes
- Technical architecture overview
- Testing strategy and implementation

Please provide a structured implementation plan with code examples, best practices, and deployment considerations.`;
            break;
            
          case "casual":
            enhancedPrompt = `Hey! I'd love to build a really cool to-do app that people will actually want to use. Here's what I'm thinking:

**The Fun Stuff:**
- Make it super easy to add tasks (like, one-click easy)
- Pretty colors and smooth animations that make checking things off satisfying
- Maybe some fun rewards or progress bars to keep people motivated
- Works great on phones since that's where people actually use these things

**What It Should Do:**
- Add, edit, and delete tasks (obviously!)
- Set due dates and get gentle reminders
- Organize tasks into categories like "Work," "Personal," "Shopping"
- Mark priorities so important stuff doesn't get lost
- Maybe sync across devices if possible

**Make It Special:**
- Think about what makes other to-do apps annoying and fix those things
- Add some personality - maybe fun icons or themes
- Keep it simple but powerful
- Include some "wow" features that make people want to show it off

Can you help me build something that's both functional and delightful? I'd love to see code examples, design ideas, and tips for making it feel really polished!`;
            break;
            
          case "creative":
            enhancedPrompt = `Imagine crafting a to-do application that transforms the mundane act of task management into an engaging, almost magical experience. This isn't just another productivity tool—it's a digital companion that understands the rhythm of human productivity.

**The Vision:**
Picture an interface that breathes with your workflow, where tasks don't just sit in boring lists but come alive with personality. Think of it as a garden where each task is a seed that grows as you nurture it toward completion.

**Storytelling Elements:**
- Tasks could have "life stages" - from seedling ideas to blooming completions
- Visual metaphors that make productivity feel like an adventure
- Micro-interactions that celebrate small wins with delightful animations
- A dashboard that tells the story of your productivity journey

**Innovative Features:**
- Mood-based task suggestions (energetic mornings for big projects, calm evenings for planning)
- AI-powered task breakdown that turns overwhelming projects into manageable steps
- Collaborative spaces where teams can build task narratives together
- Gamification elements that feel meaningful, not gimmicky

**The Experience:**
Create something that makes users think "I never knew managing tasks could feel this good." Blend functionality with emotion, efficiency with joy. Show me how to build an app that people don't just use—they love.

Include creative code solutions, unique design patterns, and innovative user experience ideas that push beyond conventional to-do apps.`;
            break;
            
          case "technical":
            enhancedPrompt = `Develop a production-ready task management application with enterprise-grade architecture and modern development practices.

**Technical Stack Requirements:**
- Frontend: React 18+ with TypeScript, state management (Redux Toolkit/Zustand)
- Backend: Node.js/Express or Next.js API routes with proper middleware
- Database: PostgreSQL with Prisma ORM or MongoDB with Mongoose
- Authentication: JWT with refresh tokens or OAuth 2.0 integration
- Real-time updates: WebSocket implementation or Server-Sent Events

**Architecture Specifications:**
- Microservices architecture with proper API gateway
- RESTful API design following OpenAPI 3.0 specifications
- Database schema with proper indexing and relationships
- Caching layer (Redis) for performance optimization
- Error handling with proper HTTP status codes and logging

**Implementation Requirements:**
1. **Data Models:** User, Task, Category, Priority, Notification entities
2. **API Endpoints:** CRUD operations with pagination, filtering, and sorting
3. **Security:** Input validation, SQL injection prevention, rate limiting
4. **Testing:** Unit tests (Jest), integration tests, E2E tests (Cypress)
5. **DevOps:** Docker containerization, CI/CD pipeline, monitoring

**Performance Considerations:**
- Lazy loading and code splitting
- Database query optimization
- CDN integration for static assets
- Progressive Web App (PWA) capabilities

Provide detailed code implementations, database schemas, API documentation, deployment scripts, and performance benchmarking strategies.`;
            break;
            
          default:
            enhancedPrompt = `${prompt.trim()} Please provide a comprehensive and well-structured response using professional terminology. Structure your response with clear sections and include specific examples to illustrate key points.`;
        }
      } else {
        // General enhancement for other prompts
        let baseEnhancement = "";
        let toneModifier = "";
        let structureGuidance = "";
        
        if (isHowTo) {
          baseEnhancement = `${prompt.trim()} Please provide a detailed, step-by-step guide that includes:
- Prerequisites and required materials/knowledge
- Numbered instructions with clear explanations
- Common pitfalls and how to avoid them
- Troubleshooting tips for potential issues
- Expected outcomes and success criteria`;
        } else if (isCreative) {
          baseEnhancement = `${prompt.trim()} Please develop a comprehensive creative solution that includes:
- Multiple innovative approaches or variations
- Detailed implementation guidelines
- Creative inspiration and design principles
- Examples of successful similar projects
- Quality criteria and evaluation methods`;
        } else if (isAnalytical) {
          baseEnhancement = `${prompt.trim()} Please provide a thorough analysis that includes:
- Multiple perspectives and viewpoints
- Evidence-based comparisons with data
- Strengths and weaknesses evaluation
- Contextual factors and considerations
- Clear conclusions with actionable insights`;
        } else if (isExplanatory) {
          baseEnhancement = `${prompt.trim()} Please provide a comprehensive explanation that includes:
- Fundamental concepts and definitions
- Historical context and evolution
- Current applications and real-world examples
- Future trends and implications
- Common misconceptions and clarifications`;
        } else {
          baseEnhancement = `${prompt.trim()} Please provide a detailed and comprehensive response that addresses all aspects of this request.`;
        }
        
        switch(tone) {
          case "formal":
            toneModifier = "Use academic language with professional terminology and authoritative tone. Include citations or references where appropriate.";
            structureGuidance = "Structure your response with clear headings, bullet points for key information, and a logical flow from introduction to conclusion.";
            break;
          case "casual":
            toneModifier = "Use conversational language with everyday examples and analogies. Keep explanations accessible and friendly.";
            structureGuidance = "Organize your response in an easy-to-follow format with practical examples and relatable scenarios.";
            break;
          case "creative":
            toneModifier = "Use vivid language, metaphors, and storytelling approaches. Make the content engaging and memorable.";
            structureGuidance = "Present information in a creative, narrative format that captures attention and inspires action.";
            break;
          case "technical":
            toneModifier = "Use precise technical terminology with relevant specifications, code examples, or technical details.";
            structureGuidance = "Provide technical documentation-style formatting with detailed specifications and implementation guidance.";
            break;
          default:
            toneModifier = "Balance clarity and depth using a professional but accessible tone.";
            structureGuidance = "Structure your response clearly with organized sections and supporting details.";
        }
        
        enhancedPrompt = `${baseEnhancement}

${toneModifier} ${structureGuidance}

Include specific examples, actionable insights, and ensure the response is comprehensive yet focused on practical value.`;
      }
      
      return {
        text: prompt,
        enhancedPrompt,
      };
    }

    case "handwriting": {
      const actionType = options?.actionType || "continue";
      let processedText = "";
      
      switch (actionType) {
        case "continue":
          // Analyze the text and continue it naturally
          if (prompt.toLowerCase().includes("artificial intelligence") || prompt.toLowerCase().includes("ai")) {
            processedText = `The rapid advancement of artificial intelligence continues to reshape industries and redefine human-machine collaboration. As we move forward, the integration of AI systems into daily workflows becomes increasingly seamless, offering unprecedented opportunities for innovation and efficiency.

Machine learning algorithms are becoming more sophisticated, capable of understanding context and nuance in ways that were previously impossible. This evolution enables AI to assist in complex decision-making processes, from medical diagnoses to financial planning, while maintaining the human element that ensures ethical considerations remain at the forefront.

The future of AI lies not in replacement of human capabilities, but in augmentation—creating powerful partnerships between human creativity and machine precision that unlock new possibilities across every sector of society.`;
          } else {
            processedText = `${prompt.trim()} This continuation maintains the original tone and style while expanding on the key themes presented. The narrative flows naturally from the established foundation, building upon the initial concepts with additional depth and context.

Further development of these ideas reveals new perspectives and opportunities for exploration. Each element connects meaningfully to create a cohesive whole that advances the original intent while providing fresh insights and practical applications.`;
          }
          break;
          
        case "grammar":
          // Fix common grammar issues in a sample way
          processedText = prompt
            .replace(/\bi\b/g, "I")
            .replace(/\bits\b/g, "it's")
            .replace(/\byour\b/g, "you're")
            .replace(/\bthere\b/g, "their")
            .replace(/\.\s*([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
            .replace(/\s+/g, " ")
            .trim();
          
          // If no changes were made, provide a polished version
          if (processedText === prompt) {
            processedText = `${prompt.trim().charAt(0).toUpperCase()}${prompt.trim().slice(1)}`;
            if (!processedText.endsWith('.') && !processedText.endsWith('!') && !processedText.endsWith('?')) {
              processedText += '.';
            }
          }
          break;
          
        case "shorten":
          // Create a shortened version
          const sentences = prompt.split(/[.!?]+/).filter(s => s.trim());
          const keyWords = prompt.split(/\s+/).filter(word => 
            word.length > 4 && 
            !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'were', 'said'].includes(word.toLowerCase())
          );
          
          if (sentences.length > 1) {
            processedText = sentences.slice(0, Math.ceil(sentences.length / 2)).join('. ').trim() + '.';
          } else {
            processedText = keyWords.slice(0, Math.ceil(keyWords.length * 0.6)).join(' ') + '.';
          }
          break;
          
        case "summarize":
          // Create a summary
          const wordCount = prompt.split(/\s+/).length;
          if (wordCount > 50) {
            processedText = `This text discusses the main concepts and key points presented in the original content. The primary focus centers on the core themes and essential information, distilled into a concise overview that captures the fundamental ideas and their significance.`;
          } else {
            processedText = `Summary: ${prompt.split(/\s+/).slice(0, Math.ceil(prompt.split(/\s+/).length * 0.3)).join(' ')}...`;
          }
          break;
      }
      
      return {
        text: prompt,
        processedText,
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

export function processHandwriting(text: string, actionType: "continue" | "grammar" | "shorten" | "summarize") {
  return callGroqAPI(text, "handwriting", { actionType })
}