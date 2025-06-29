"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Lightbulb, 
  Target,
  RefreshCw,
  MessageSquare,
  Sparkles
} from "lucide-react"
import { processEducationalChat } from "@/lib/groq-service"

interface ChatMessage {
  id: string
  content: string
  role: "user" | "tutor"
  timestamp: Date
  emoji?: string
}

interface AIChatTutorProps {
  onBackToMain?: () => void
}

export function AIChatTutor({ onBackToMain }: AIChatTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hello! 👋 I'm your AI tutor, ready to help you learn anything! What would you like to explore today? 📚✨",
      role: "tutor",
      timestamp: new Date(),
      emoji: "🤖"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")
  const [learningLevel, setLearningLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner")
  const [tutorPersonality, setTutorPersonality] = useState<"friendly" | "professional" | "enthusiastic">("friendly")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await processEducationalChat(currentInput, {
        topic: currentTopic,
        level: learningLevel,
        personality: tutorPersonality,
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      })

      const tutorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response || "I'm here to help! Could you tell me more about what you'd like to learn? 🤔",
        role: "tutor",
        timestamp: new Date(),
        emoji: response.emoji || "🎓"
      }

      setMessages(prev => [...prev, tutorMessage])
      
      // Update current topic if detected
      if (response.detectedTopic) {
        setCurrentTopic(response.detectedTopic)
      }
    } catch (error) {
      console.error("Error in chat:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Oops! I had a little hiccup there. 😅 Could you try asking that again? I'm excited to help you learn! 🌟",
        role: "tutor",
        timestamp: new Date(),
        emoji: "😊"
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! 👋 I'm your AI tutor, ready to help you learn anything! What would you like to explore today? 📚✨",
        role: "tutor",
        timestamp: new Date(),
        emoji: "🤖"
      }
    ])
    setCurrentTopic("")
  }

  const suggestTopics = [
    { topic: "Mathematics", emoji: "🔢", description: "Algebra, Calculus, Geometry" },
    { topic: "Science", emoji: "🔬", description: "Physics, Chemistry, Biology" },
    { topic: "History", emoji: "📜", description: "World History, Ancient Civilizations" },
    { topic: "Programming", emoji: "💻", description: "JavaScript, Python, Web Development" },
    { topic: "Languages", emoji: "🌍", description: "Grammar, Vocabulary, Conversation" },
    { topic: "Literature", emoji: "📖", description: "Analysis, Writing, Poetry" }
  ]

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="border-blue-200 shadow-lg mb-4">
        <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
                <GraduationCap className="h-5 w-5" />
                AI Chat Tutor
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription className="text-blue-700">
                Your personal AI tutor for any subject! Ask questions, get explanations, and learn at your own pace.
              </CardDescription>
            </div>
            {currentTopic && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                📚 {currentTopic}
              </Badge>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">Learning Level</label>
              <Select value={learningLevel} onValueChange={(value: any) => setLearningLevel(value)}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🌱 Beginner</SelectItem>
                  <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                  <SelectItem value="advanced">🌳 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">Tutor Style</label>
              <Select value={tutorPersonality} onValueChange={(value: any) => setTutorPersonality(value)}>
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">😊 Friendly</SelectItem>
                  <SelectItem value="professional">🎓 Professional</SelectItem>
                  <SelectItem value="enthusiastic">🎉 Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearChat}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-blue-200 shadow-lg flex flex-col">
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "tutor" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{message.emoji || "🎓"}</span>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤔</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Topics */}
          {messages.length <= 1 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Popular Topics to Explore:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {suggestTopics.map((item) => (
                  <Button
                    key={item.topic}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(`I want to learn about ${item.topic}`)}
                    className="justify-start text-left h-auto p-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <span>{item.emoji}</span>
                        {item.topic}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything! I'm here to help you learn... 🤓"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="pr-12 border-blue-200 focus:border-blue-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Tip: Be specific about what you want to learn for the best explanations!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}