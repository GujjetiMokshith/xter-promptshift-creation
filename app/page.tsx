"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Send, 
  Bot, 
  User, 
  Wand2, 
  FileText, 
  PenTool, 
  ChevronDown, 
  Home,
  Settings,
  HelpCircle,
  GraduationCap,
  Brain
} from "lucide-react"
import { PromptEnhancer } from "@/components/prompt-enhancer"
import { DocumentAnalyzer } from "@/components/document-analyzer"
import { HandwritingAssistant } from "@/components/handwriting-assistant"
import { AIChatTutor } from "@/components/handwriting/ai-chat-tutor"
import { AIQuizGenerator } from "@/components/handwriting/ai-quiz-generator"
import Link from "next/link"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type Agent = "enhancer" | "analyzer" | "handwriting" | "educational"

const agents = [
  {
    id: "enhancer" as Agent,
    name: "Prompt Enhancer",
    description: "Transform basic prompts into powerful instructions",
    icon: <Wand2 className="h-4 w-4" />,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    id: "analyzer" as Agent,
    name: "Document Analyzer", 
    description: "Analyze and extract insights from documents",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    id: "handwriting" as Agent,
    name: "Handwriting Tools",
    description: "Continue writing, fix grammar, and more",
    icon: <PenTool className="h-4 w-4" />,
    color: "bg-green-500",
    bgColor: "bg-green-50", 
    borderColor: "border-green-200"
  },
  {
    id: "educational" as Agent,
    name: "Educational Tools",
    description: "AI tutoring and quiz generation",
    icon: <GraduationCap className="h-4 w-4" />,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
]

const handwritingTools = [
  {
    id: "continue",
    name: "Continue Writing",
    description: "AI continues your text naturally",
    icon: <PenTool className="h-4 w-4" />
  },
  {
    id: "grammar", 
    name: "Grammar Fixer",
    description: "Fix grammar and improve style",
    icon: <FileText className="h-4 w-4" />
  }
]

const educationalTools = [
  {
    id: "tutor",
    name: "AI Chat Tutor", 
    description: "Interactive AI tutor for any subject",
    icon: <GraduationCap className="h-4 w-4" />
  },
  {
    id: "quiz",
    name: "Quiz Generator",
    description: "Create custom quizzes on any topic", 
    icon: <Brain className="h-4 w-4" />
  }
]

export default function TypingMindInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<Agent>("enhancer")
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [showHandwritingTools, setShowHandwritingTools] = useState(false)
  const [showEducationalTools, setShowEducationalTools] = useState(false)
  const [selectedHandwritingTool, setSelectedHandwritingTool] = useState<string | null>(null)
  const [selectedEducationalTool, setSelectedEducationalTool] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeAgent === "handwriting") {
      setShowHandwritingTools(true)
      setShowEducationalTools(false)
    } else if (activeAgent === "educational") {
      setShowEducationalTools(true) 
      setShowHandwritingTools(false)
    } else {
      setShowHandwritingTools(false)
      setShowEducationalTools(false)
    }
    setSelectedHandwritingTool(null)
    setSelectedEducationalTool(null)
  }, [activeAgent])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you want to work with the ${agents.find(a => a.id === activeAgent)?.name}. This is a simulated response for demonstration purposes.`,
        role: "assistant", 
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const currentAgent = agents.find(agent => agent.id === activeAgent)

  const handleBackToMain = () => {
    setSelectedHandwritingTool(null)
    setSelectedEducationalTool(null)
    setActiveAgent("enhancer")
  }

  // Render individual tool components
  if (selectedHandwritingTool) {
    return (
      <div className="app-container">
        <div className="content-area">
          <HandwritingAssistant />
        </div>
      </div>
    )
  }

  if (selectedEducationalTool === "tutor") {
    return (
      <div className="app-container">
        <div className="content-area">
          <AIChatTutor />
        </div>
      </div>
    )
  }

  if (selectedEducationalTool === "quiz") {
    return (
      <div className="app-container">
        <div className="content-area">
          <AIQuizGenerator />
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <TooltipProvider>
          {/* Home */}
          <div className="tooltip-wrapper">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-icon">
                  <Home className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="sidebar-tooltip">
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Settings */}
          <div className="tooltip-wrapper">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-icon">
                  <Settings className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="sidebar-tooltip">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Help */}
          <div className="tooltip-wrapper">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-icon">
                  <HelpCircle className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="sidebar-tooltip">
                <p>Help & Support</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="blue-glow-top">
          {/* Render specific agent components */}
          {activeAgent === "enhancer" && <PromptEnhancer />}
          {activeAgent === "analyzer" && <DocumentAnalyzer onBackToMain={handleBackToMain} />}
          {activeAgent === "handwriting" && !selectedHandwritingTool && <HandwritingAssistant />}
          {activeAgent === "educational" && !selectedEducationalTool && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
                    <GraduationCap className="h-5 w-5" />
                    Educational Tools
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Choose an educational tool to enhance your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educationalTools.map((tool) => (
                      <Card 
                        key={tool.id}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border-blue-200"
                        onClick={() => setSelectedEducationalTool(tool.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {tool.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{tool.name}</h3>
                              <p className="text-sm text-gray-600">{tool.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer with Chat Interface */}
        <div className="footer">
          <div className="max-w-4xl mx-auto">
            {/* Agent Selector */}
            <div className="mb-4">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                  className={`w-full justify-between ${currentAgent?.borderColor} ${currentAgent?.bgColor} hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${currentAgent?.color} rounded-md flex items-center justify-center text-white`}>
                      {currentAgent?.icon}
                    </div>
                    <span className="font-medium">{currentAgent?.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showAgentDropdown && (
                  <div className="footer-agents-dropdown">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">AI AGENTS</div>
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="agent-card"
                          onClick={() => {
                            setActiveAgent(agent.id)
                            setShowAgentDropdown(false)
                          }}
                        >
                          <div className={`agent-icon ${agent.color}`}>
                            {agent.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{agent.name}</div>
                            <div className="text-xs text-gray-500">{agent.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Handwriting Tools Dropdown */}
            {showHandwritingTools && (
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Choose Handwriting Tool
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {handwritingTools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant="outline"
                        onClick={() => setSelectedHandwritingTool(tool.id)}
                        className="justify-start h-auto p-3 border-green-200 hover:bg-green-50"
                      >
                        <div className="flex items-center gap-2">
                          {tool.icon}
                          <div className="text-left">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-600">{tool.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Educational Tools Dropdown */}
            {showEducationalTools && (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Choose Educational Tool
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {educationalTools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant="outline"
                        onClick={() => setSelectedEducationalTool(tool.id)}
                        className="justify-start h-auto p-3 border-blue-200 hover:bg-blue-50"
                      >
                        <div className="flex items-center gap-2">
                          {tool.icon}
                          <div className="text-left">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-600">{tool.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder={`Message ${currentAgent?.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="chat-input"
              />
              <div className="chat-input-buttons">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="chat-input-button bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Press Enter to send</span>
                <Badge variant="outline" className="text-xs">
                  {currentAgent?.name}
                </Badge>
              </div>
              <Link href="/handwriting" className="hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-1">
                  <PenTool className="h-3 w-3" />
                  Handwriting Tools
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}