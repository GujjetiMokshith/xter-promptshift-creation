"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import "./globals.css"
import {
  Plus,
  Copy,
  MessageSquare,
  Settings,
  Mic,
  Send,
  Bot,
  User,
  ChevronDown,
  Sparkles,
  Wand2,
  LineChart,
  ExternalLink,
  Key,
  AlertCircle,
  PenTool,
  ArrowRight,
  FileText,
  BookOpen,
  Palette,
  History,
  Trash2,
  Edit3,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Star,
  Archive,
  Download,
  Share2,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  UserCircle,
  Crown,
  Zap,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { analyzePrompt, enhancePrompt, processHandwriting, analyzeDocument } from "@/lib/groq-service"
import { useRouter } from "next/navigation"
import { ContinueWriting } from "@/components/handwriting/continue-writing"
import { GrammarFixer } from "@/components/handwriting/grammar-fixer"
import { TextSummarizer } from "@/components/handwriting/text-summarizer"
import { DrawingCanvas } from "@/components/handwriting/drawing-canvas"
import { DocumentAnalyzer } from "@/components/document-analyzer"

interface Message {
  id: string
  content: string
  role: "user" | "ai"
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  agentId: string
  starred?: boolean
  archived?: boolean
}

interface Agent {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  category: "core" | "writing" | "analysis"
  premium?: boolean
}

interface PromptHistory {
  id: string
  content: string
  timestamp: Date
}

export default function Home() {
  const router = useRouter()

  // State for messages in current chat
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // State for chat history
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Enhanced sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [chatFilter, setChatFilter] = useState<"all" | "starred" | "archived">("all")
  const [darkMode, setDarkMode] = useState(false)

  // State for footer dropdowns
  const [showFooterAgents, setShowFooterAgents] = useState(false)

  // State for handwriting tools
  const [showHandwritingTools, setShowHandwritingTools] = useState(false)
  const [activeHandwritingTool, setActiveHandwritingTool] = useState<string | null>(null)

  // State for document analyzer
  const [showDocumentAnalyzer, setShowDocumentAnalyzer] = useState(false)

  // State for AI agents
  const [currentAgent, setCurrentAgent] = useState<Agent>({
    id: "enhancer",
    name: "Prompt Enhancer",
    icon: <Wand2 size={14} className="text-white" />,
    description: "Automatically rewrites prompts to be more detailed, creative, or direct.",
    color: "bg-indigo-500",
    category: "core",
  })

  // State for prompt history
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([])

  // State for API key status
  const [hasApiKey, setHasApiKey] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enhanced AI agents with categories
  const agents: Agent[] = useMemo(() => [
    // Core AI Tools
    {
      id: "enhancer",
      name: "Prompt Enhancer",
      icon: <Wand2 size={14} className="text-white" />,
      description: "Transform basic prompts into detailed, effective instructions",
      color: "bg-indigo-500",
      category: "core",
    },
    {
      id: "analyzer",
      name: "Prompt Analyzer",
      icon: <LineChart size={14} className="text-white" />,
      description: "Rate and analyze prompt quality with detailed feedback",
      color: "bg-amber-500",
      category: "analysis",
    },
    // Writing Tools
    {
      id: "handwriting",
      name: "Writing Assistant",
      icon: <PenTool size={14} className="text-white" />,
      description: "Continue writing, fix grammar, and improve text",
      color: "bg-green-500",
      category: "writing",
    },
    {
      id: "document-analyzer",
      name: "Document Analyzer",
      icon: <FileText size={14} className="text-white" />,
      description: "Analyze documents with AI-powered insights",
      color: "bg-orange-500",
      category: "analysis",
      premium: true,
    },
  ], [])

  // Memoized handwriting tools
  const handwritingTools = useMemo(() => [
    {
      id: "continue",
      name: "Continue Writing",
      icon: <ArrowRight className="h-5 w-5" />,
      description: "AI continues your text naturally",
      color: "bg-blue-500",
      component: <ContinueWriting />
    },
    {
      id: "grammar",
      name: "Grammar & Style Fixer",
      icon: <FileText className="h-5 w-5" />,
      description: "Fix grammar and improve style",
      color: "bg-emerald-500",
      component: <GrammarFixer />
    },
    {
      id: "summarize",
      name: "Text Summarizer",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Create summaries and shorten text",
      color: "bg-purple-500",
      component: <TextSummarizer />
    },
    {
      id: "canvas",
      name: "Digital Canvas",
      icon: <Palette className="h-5 w-5" />,
      description: "Professional drawing and handwriting",
      color: "bg-orange-500",
      component: <DrawingCanvas />
    }
  ], [])

  // Filter chats based on search and filter
  const filteredChats = useMemo(() => {
    let filtered = chats;
    
    // Apply filter
    if (chatFilter === "starred") {
      filtered = filtered.filter(chat => chat.starred);
    } else if (chatFilter === "archived") {
      filtered = filtered.filter(chat => chat.archived);
    } else {
      filtered = filtered.filter(chat => !chat.archived);
    }
    
    // Apply search
    if (chatSearchQuery.trim()) {
      filtered = filtered.filter(chat => 
        chat.title.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
        )
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [chats, chatSearchQuery, chatFilter]);

  // Optimized auto-scroll with debouncing
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, scrollToBottom])

  // Focus input on load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  // Check for API key
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
    setHasApiKey(!!apiKey && apiKey !== 'your_groq_api_key_here')
  }, [])

  // Optimized localStorage operations with error handling
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("typingmind-chats")
      const savedSettings = localStorage.getItem("typingmind-settings")
      
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats)
        setChats(parsedChats)

        if (parsedChats.length > 0) {
          const mostRecentChat = parsedChats.sort(
            (a: Chat, b: Chat) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0]
          setCurrentChatId(mostRecentChat.id)
          setMessages(mostRecentChat.messages)
        }
      }
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setSidebarCollapsed(settings.sidebarCollapsed || false)
        setDarkMode(settings.darkMode || false)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      localStorage.removeItem("typingmind-chats")
      localStorage.removeItem("typingmind-settings")
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      sidebarCollapsed,
      darkMode,
    }
    try {
      localStorage.setItem("typingmind-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }, [sidebarCollapsed, darkMode])

  // Debounced save to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem("typingmind-chats", JSON.stringify(chats))
        } catch (error) {
          console.error("Error saving chats:", error)
        }
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [chats])

  // Optimized chat update
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat.id === currentChatId ? { ...chat, messages } : chat
        )
      )
    }
  }, [messages, currentChatId])

  // Optimized click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".footer-agents-dropdown") && !target.closest(".footer-agents-button")) {
        setShowFooterAgents(false)
      }
      if (!target.closest(".handwriting-tools-dropdown") && !target.closest(".handwriting-tools-button")) {
        setShowHandwritingTools(false)
      }
      if (!target.closest(".profile-menu") && !target.closest(".profile-button")) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Optimized message sending with better error handling
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return

    // Create a new chat if there isn't one
    if (!currentChatId) {
      createNewChat()
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Add to prompt history
    const newPrompt: PromptHistory = {
      id: Date.now().toString(),
      content: inputValue,
      timestamp: new Date(),
    }
    setPromptHistory((prev) => [newPrompt, ...prev.slice(0, 49)])

    const currentInput = inputValue
    setInputValue("")

    // Simulate AI typing
    setIsTyping(true)

    try {
      let response

      switch (currentAgent.id) {
        case "enhancer":
          response = await enhancePrompt(currentInput).catch(error => {
            console.error("Error enhancing prompt:", error);
            return { text: "I encountered an error while enhancing your prompt.", enhancedPrompt: "" };
          });
          break;
        case "analyzer":
          response = await analyzePrompt(currentInput).catch(error => {
            console.error("Error analyzing prompt:", error);
            return { text: "I encountered an error while analyzing your prompt.", analysis: { score: 0, strengths: [], weaknesses: [], suggestions: [] } };
          });
          break;
        case "handwriting":
          response = await processHandwriting(currentInput, "continue").catch(error => {
            console.error("Error processing handwriting:", error);
            return { text: "I encountered an error while processing your text.", processedText: "" };
          });
          break;
        case "document-analyzer":
          response = await analyzeDocument(currentInput, "summarize").catch(error => {
            console.error("Error analyzing document:", error);
            return { text: "I encountered an error while analyzing your document.", processedText: "" };
          });
          break;
        default:
          response = { text: "I'm not sure how to process that request." };
      }

      // Format the response based on the agent type
      let responseText = ""

      if (currentAgent.id === "enhancer" && response.enhancedPrompt) {
        responseText = `Here's your enhanced prompt:\n\n"${response.enhancedPrompt}"`
      } else if (currentAgent.id === "analyzer" && response.analysis) {
        const { score, strengths, weaknesses, suggestions } = response.analysis
        responseText = `Prompt Analysis Score: ${score}/100\n\n## Strengths\n${strengths.map((s) => `- ${s}`).join("\n")}\n\n## Areas for improvement\n${weaknesses.map((w) => `- ${w}`).join("\n")}\n\n## Suggestions\n${suggestions.map((s) => `- ${s}`).join("\n")}`
      } else if (currentAgent.id === "handwriting" && response.processedText) {
        responseText = `Here's the continued text:\n\n${response.processedText}`
      } else if (currentAgent.id === "document-analyzer" && response.processedText) {
        responseText = `Here's the document analysis:\n\n${response.processedText}`
      } else {
        responseText = response.text || "I processed your request but couldn't generate a proper response."
      }

      // Add AI response with delay for natural feel
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: "ai",
        timestamp: new Date(),
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      console.error("Error processing with AI service:", error)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        role: "ai",
        timestamp: new Date(),
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1000)
    }
  }, [inputValue, currentChatId, currentAgent.id])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString()
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      agentId: currentAgent.id,
    }

    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages([])
    setShowChatHistory(false)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [currentAgent.id])

  const selectChat = useCallback((chatId: string) => {
    const selectedChat = chats.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChatId(chatId)
      setMessages(selectedChat.messages)
      setShowChatHistory(false)
    }
  }, [chats])

  const toggleChatStar = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, starred: !chat.starred } : chat
    ))
  }, [])

  const archiveChat = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, archived: !chat.archived } : chat
    ))
  }, [])

  const deleteChat = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this chat?")) {
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    }
  }, [currentChatId])

  const selectAgent = useCallback((agent: Agent) => {
    if (agent) {
      setCurrentAgent(agent)
      setShowFooterAgents(false)
      
      // Reset special states
      setShowHandwritingTools(false)
      setActiveHandwritingTool(null)
      setShowDocumentAnalyzer(false)
      
      // If handwriting assistant is selected, show tools
      if (agent.id === "handwriting") {
        setShowHandwritingTools(true)
      } else if (agent.id === "document-analyzer") {
        setShowDocumentAnalyzer(true)
        return // Don't create new chat for document analyzer
      }
      
      // Reset messages to show empty chat with the new agent
      setMessages([])
      
      // Create a new chat for this agent
      const newChatId = Date.now().toString()
      const newChat = {
        id: newChatId,
        title: `New ${agent.name} Chat`,
        messages: [],
        createdAt: new Date(),
        agentId: agent.id,
      }
      
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
      
      // Focus the input field
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [])

  const selectHandwritingTool = useCallback((toolId: string) => {
    setActiveHandwritingTool(toolId)
    setShowHandwritingTools(false)
    setMessages([])
  }, [])

  const handlePromptClick = useCallback((prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }, [])

  const toggleFooterAgents = useCallback(() => {
    setShowFooterAgents(!showFooterAgents)
    setShowHandwritingTools(false)
  }, [showFooterAgents])

  const toggleHandwritingTools = useCallback(() => {
    setShowHandwritingTools(!showHandwritingTools)
    setShowFooterAgents(false)
  }, [showHandwritingTools])

  const backToChat = useCallback(() => {
    setActiveHandwritingTool(null)
    setShowDocumentAnalyzer(false)
    setMessages([])
  }, [])

  const formatChatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // If document analyzer is active, show its component
  if (showDocumentAnalyzer) {
    return (
      <div className="app-container">
        <TooltipProvider delayDuration={300}>
          <div className={`sidebar ${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!sidebarCollapsed && (
                <h2 className="font-semibold text-gray-900">Document Analyzer</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="p-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={backToChat}
                    className={`${sidebarCollapsed ? 'w-8 h-8 p-0' : 'w-full'} mb-4`}
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    {!sidebarCollapsed && <span className="ml-2">Back to Chat</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Back to Chat</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>

        <div className="flex-1 flex flex-col blue-glow-top">
          <div className="content-area">
            <DocumentAnalyzer onBackToMain={backToChat} />
          </div>
        </div>
      </div>
    )
  }

  // If a handwriting tool is active, show its component
  if (activeHandwritingTool) {
    const tool = handwritingTools.find(t => t.id === activeHandwritingTool)
    
    if (tool?.id === 'canvas') {
      return (
        <div className="h-screen">
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={backToChat}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Chat
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-600" />
                  <h1 className="text-xl font-bold text-gray-900">Digital Handwriting Canvas</h1>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHandwritingTools}
                className="handwriting-tools-button flex items-center gap-2"
              >
                <PenTool className="h-4 w-4" />
                Tools
              </Button>
            </div>
          </div>
          
          <div className="h-[calc(100vh-60px)]">
            {tool.component}
          </div>

          {showHandwritingTools && (
            <div className="absolute top-16 right-4 footer-agents-dropdown handwriting-tools-dropdown">
              <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100/20">
                <h3 className="font-medium text-sm">Switch Tool</h3>
              </div>
              <div className="p-2">
                {handwritingTools.map((toolOption) => (
                  <div
                    key={toolOption.id}
                    className={`agent-option ${toolOption.id === activeHandwritingTool ? 'active' : ''}`}
                    onClick={() => selectHandwritingTool(toolOption.id)}
                  >
                    <div className={`w-6 h-6 ${toolOption.color} rounded-md flex items-center justify-center text-white`}>
                      {toolOption.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{toolOption.name}</div>
                      <div className="text-xs text-gray-500">{toolOption.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="app-container">
        <TooltipProvider delayDuration={300}>
          <div className={`sidebar ${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {!sidebarCollapsed && (
                <h2 className="font-semibold text-gray-900">{tool?.name}</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="p-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={backToChat}
                    className={`${sidebarCollapsed ? 'w-8 h-8 p-0' : 'w-full'} mb-4`}
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    {!sidebarCollapsed && <span className="ml-2">Back to Chat</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Back to Chat</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>

        <div className="flex-1 flex flex-col blue-glow-top">
          <div className="content-area">
            <div className="max-w-6xl mx-auto h-full">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {tool?.icon}
                  <h1 className="text-2xl font-bold text-gray-900">{tool?.name}</h1>
                </div>
                <p className="text-gray-600">{tool?.description}</p>
              </div>
              {tool?.component}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <TooltipProvider delayDuration={300}>
        {/* Enhanced Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-bold text-gray-900">TypingMind</h1>
                {hasApiKey && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Zap className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={createNewChat}
                  className={`${sidebarCollapsed ? 'w-8 h-8 p-0' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
                >
                  <Plus className="h-4 w-4" />
                  {!sidebarCollapsed && <span className="ml-2">New Chat</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-hidden">
            {!sidebarCollapsed ? (
              <div className="p-4">
                {/* Chat History Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatHistory(!showChatHistory)}
                      className="h-6 w-6"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </div>

                  {showChatHistory && (
                    <div className="space-y-3">
                      {/* Search and Filter */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search chats..."
                            value={chatSearchQuery}
                            onChange={(e) => setChatSearchQuery(e.target.value)}
                            className="pl-9 h-8 text-sm"
                          />
                        </div>
                        
                        <div className="flex gap-1">
                          {[
                            { key: "all", label: "All", icon: MessageSquare },
                            { key: "starred", label: "Starred", icon: Star },
                            { key: "archived", label: "Archived", icon: Archive },
                          ].map(({ key, label, icon: Icon }) => (
                            <Button
                              key={key}
                              variant={chatFilter === key ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setChatFilter(key as any)}
                              className="flex-1 h-7 text-xs"
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Chat List */}
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {filteredChats.length > 0 ? (
                          filteredChats.map((chat) => (
                            <div
                              key={chat.id}
                              className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                                currentChatId === chat.id ? "bg-blue-50 border border-blue-200" : "border border-transparent"
                              }`}
                              onClick={() => selectChat(chat.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {chat.title || "New Chat"}
                                    </h4>
                                    {chat.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                                    {chat.archived && <Archive className="h-3 w-3 text-gray-400" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatChatDate(new Date(chat.createdAt))}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {chat.messages.length} msgs
                                    </Badge>
                                  </div>
                                  {chat.messages.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => toggleChatStar(chat.id, e)}
                                    className="h-6 w-6"
                                  >
                                    <Star className={`h-3 w-3 ${chat.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => archiveChat(chat.id, e)}
                                    className="h-6 w-6"
                                  >
                                    <Archive className="h-3 w-3 text-gray-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => deleteChat(chat.id, e)}
                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No chats found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Tools Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">AI Tools</h3>
                  <div className="space-y-2">
                    {agents.filter(agent => agent.category === "core").map((agent) => (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          currentAgent.id === agent.id ? "bg-blue-50 border border-blue-200" : ""
                        }`}
                        onClick={() => selectAgent(agent)}
                      >
                        <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center`}>
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                            {agent.premium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Writing Tools Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Writing Tools</h3>
                  <div className="space-y-2">
                    {agents.filter(agent => agent.category === "writing").map((agent) => (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          currentAgent.id === agent.id ? "bg-blue-50 border border-blue-200" : ""
                        }`}
                        onClick={() => selectAgent(agent)}
                      >
                        <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center`}>
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                            {agent.premium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis Tools Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Analysis Tools</h3>
                  <div className="space-y-2">
                    {agents.filter(agent => agent.category === "analysis").map((agent) => (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          currentAgent.id === agent.id ? "bg-blue-50 border border-blue-200" : ""
                        }`}
                        onClick={() => selectAgent(agent)}
                      >
                        <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center`}>
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                            {agent.premium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Collapsed sidebar navigation
              <div className="p-2 space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatHistory(!showChatHistory)}
                      className="w-full h-10"
                    >
                      <History className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Chat History</p>
                  </TooltipContent>
                </Tooltip>

                {agents.map((agent) => (
                  <Tooltip key={agent.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentAgent.id === agent.id ? "default" : "ghost"}
                        size="icon"
                        onClick={() => selectAgent(agent)}
                        className="w-full h-10"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {React.cloneElement(agent.icon as React.ReactElement, {
                            size: 16,
                            className: currentAgent.id === agent.id ? "text-white" : "text-gray-600"
                          })}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDarkMode(!darkMode)}
                      className="h-8 w-8"
                    >
                      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="profile-button h-8 w-8 bg-gray-100 hover:bg-gray-200"
                    >
                      <UserCircle className="h-4 w-4" />
                    </Button>

                    {showProfileMenu && (
                      <div className="profile-menu absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">User Account</p>
                          <p className="text-xs text-gray-500">Free Plan</p>
                        </div>
                        <div className="py-1">
                          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                            <UserCircle className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </Button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-red-600 hover:text-red-700">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full h-8"
                      >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Toggle Theme</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-8"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="profile-button w-full h-8 bg-gray-100 hover:bg-gray-200"
                      >
                        <UserCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Profile Menu</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat History Dropdown for collapsed sidebar */}
        {sidebarCollapsed && showChatHistory && (
          <div className="fixed left-16 top-20 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Recent Chats</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={createNewChat}>
                <Plus className="h-3 w-3 mr-1" /> New
              </Button>
            </div>
            
            <div className="space-y-2">
              {filteredChats.length > 0 ? (
                filteredChats.slice(0, 10).map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50 ${
                      currentChatId === chat.id ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {chat.title || "New Chat"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatChatDate(new Date(chat.createdAt))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 p-2">No chat history yet</div>
              )}
            </div>
          </div>
        )}

      </TooltipProvider>

      {/* Main Content with enhanced blue glow */}
      <div className="flex-1 flex flex-col blue-glow-top">
        <div className="content-area">
          {messages.length === 0 ? (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex flex-col items-center text-center mb-8 mt-16">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M12 16V12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M12 8H12.01"
                      stroke="#2563EB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium mb-1">Hey, I'm TypingMind.</h1>
                <p className="text-gray-500">How can I help you with your prompts today?</p>
                
                {/* API Key Status */}
                {!hasApiKey && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-800">
                      Using demo mode. Add your Groq API key to <code className="bg-amber-100 px-1 rounded">.env.local</code> for enhanced AI responses.
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium">Your AI Tools</h2>
                  {hasApiKey && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Key className="h-3 w-3" />
                      <span>Groq API Connected</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "enhancer")!)}
                  >
                      <div className="agent-icon bg-indigo-100">
                        <Wand2 size={16} className="text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Prompt Enhancer</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically rewrites prompts to be more detailed, creative, or direct. Offers tone control
                          and adds context.
                        </p>
                      </div>
                    </div>

                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "analyzer")!)}
                  >
                      <div className="agent-icon bg-amber-100">
                        <LineChart size={16} className="text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Prompt Analyzer</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Rates prompt quality based on clarity and effectiveness. Gives real-time suggestions and
                          explanations.
                        </p>
                      </div>
                    </div>

                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "handwriting")!)}
                  >
                      <div className="agent-icon bg-green-100">
                        <PenTool size={16} className="text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Writing Assistant</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Continue writing, fix grammar, shorten text, or create summaries with AI assistance.
                        </p>
                      </div>
                    </div>

                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "document-analyzer")!)}
                  >
                      <div className="agent-icon bg-orange-100">
                        <FileText size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Document Analyzer</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload and analyze documents with AI-powered insights, summaries, and keyword extraction.
                        </p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message message-${message.role} ${
                    message.role === "ai" ? currentAgent.id : ""
                  }`}
                >
                  {message.role === "ai" && (
                    <div className="message-avatar">
                      <span className={`text-xs font-bold ${
                        currentAgent.id === "enhancer" ? "text-indigo-500" : 
                        currentAgent.id === "analyzer" ? "text-amber-500" : 
                        currentAgent.id === "handwriting" ? "text-green-500" : 
                        currentAgent.id === "document-analyzer" ? "text-orange-500" : "text-indigo-500"
                      }`}>A</span>
                    </div>
                  )}
                  <div className="message-content">
                    <div className="whitespace-pre-wrap">
                      {message.content.split('\n').map((line, i) => {
                        // For enhanced prompt display (single output)
                        if (line.startsWith("Here's your enhanced prompt:") || line.startsWith("Here's the continued text:") || line.startsWith("Here's the document analysis:")) {
                          return <div key={i} className="font-medium text-indigo-700 mb-2">{line}</div>;
                        }
                        
                        // For enhanced prompt content (quoted text)
                        if (line.startsWith('"') && line.endsWith('"')) {
                          const promptText = line.slice(1, -1); // Remove quotes
                          return (
                            <div key={i} className="enhanced-prompt-display">
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm text-indigo-900 leading-relaxed">{promptText}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="ml-2 flex-shrink-0 hover:bg-indigo-100"
                                    onClick={() => {
                                      navigator.clipboard.writeText(promptText);
                                    }}
                                  >
                                    <Copy className="h-4 w-4 text-indigo-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        // For Analyzer's score display
                        if (line.startsWith("Prompt Analysis Score:")) {
                          const score = parseInt(line.split(":")[1]);
                          const scoreClass = score >= 90 ? "score-high" : score >= 70 ? "score-medium" : "score-low";
                          
                          return (
                            <div key={i} className="score-display-container">
                              <div className="score-header">Prompt Analysis Score</div>
                              <div className="score-display">
                                <div className="score-circle-container">
                                  <div className={`score-circle ${scoreClass}`}>
                                    <span className="score-value">{score}</span>
                                    <span className="score-max">/100</span>
                                  </div>
                                </div>
                                <div className="score-bar-container">
                                  <div className="score-label">
                                    <span>{score < 70 ? "Needs Improvement" : score < 90 ? "Good" : "Excellent"}</span>
                                  </div>
                                  <div className="score-bar-background">
                                    <div 
                                      className={`score-bar ${scoreClass}`}
                                      style={{ width: `${score}%` }}
                                    ></div>
                                  </div>
                                  <div className="score-markers">
                                    <div className="score-marker" style={{ left: "0%" }}>0</div>
                                    <div className="score-marker" style={{ left: "25%" }}>25</div>
                                    <div className="score-marker" style={{ left: "50%" }}>50</div>
                                    <div className="score-marker" style={{ left: "75%" }}>75</div>
                                    <div className="score-marker" style={{ left: "100%" }}>100</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        // For section headers in analyzer output
                        if (line.startsWith("## ")) {
                          const sectionTitle = line.substring(3);
                          const sectionType = 
                            sectionTitle.includes("Strengths") ? "strengths" : 
                            sectionTitle.includes("Areas") ? "weaknesses" : 
                            sectionTitle.includes("Suggestions") ? "suggestions" : "default";
                          
                          return (
                            <div key={i} className={`analysis-section-header ${sectionType}`}>
                              <div className="section-icon"></div>
                              <h3>{sectionTitle}</h3>
                            </div>
                          );
                        }
                        
                        // For strength/weakness bullet points
                        if (line.startsWith("- ") && message.content.includes("Strengths:") && message.content.includes("Areas for improvement:")) {
                          const itemText = line.substring(2);
                          
                          // Determine if this is a strength, weakness or suggestion
                          const isStrength = message.content.indexOf(line) > message.content.indexOf("Strengths:") && 
                                            message.content.indexOf(line) < message.content.indexOf("Areas for improvement:");
                          
                          const isWeakness = message.content.indexOf(line) > message.content.indexOf("Areas for improvement:") && 
                                            message.content.indexOf(line) < message.content.indexOf("Suggestions:");
                          
                          const isSuggestion = message.content.indexOf(line) > message.content.indexOf("Suggestions:");
                          
                          if (isStrength) {
                            return (
                              <div key={i} className="analysis-badge-container strength">
                                <div className="analysis-badge-icon">✓</div>
                                <span className="analysis-badge strength-badge">{itemText}</span>
                              </div>
                            );
                          } else if (isWeakness) {
                            return (
                              <div key={i} className="analysis-badge-container weakness">
                                <div className="analysis-badge-icon">!</div>
                                <span className="analysis-badge weakness-badge">{itemText}</span>
                              </div>
                            );
                          } else if (isSuggestion) {
                            return (
                              <div key={i} className="analysis-badge-container suggestion">
                                <div className="analysis-badge-icon">↑</div>
                                <span className="analysis-badge suggestion-badge">{itemText}</span>
                              </div>
                            );
                          }
                        }
                        
                        // Default rendering for other lines
                        return <span key={i}>{line}<br/></span>;
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="message-avatar">
                      <span className="text-blue-500 text-xs font-bold">U</span>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="message message-ai">
                  <div className="message-avatar">
                    <span className="text-indigo-500 text-xs font-bold">A</span>
                  </div>
                  <div className="message-content">
                    <p className="flex gap-1">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse delay-100">.</span>
                      <span className="animate-pulse delay-200">.</span>
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="footer">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                ref={inputRef}
                className={`chat-input transition-smooth ${currentAgent.id}-input`}
                placeholder={
                  currentAgent.id === "enhancer" 
                    ? "Enter a prompt to enhance..." 
                    : currentAgent.id === "analyzer"
                    ? "Enter a prompt to analyze..." 
                    : currentAgent.id === "handwriting"
                    ? "Enter text to continue, fix, shorten, or summarize..."
                    : currentAgent.id === "document-analyzer"
                    ? "Enter document text to analyze or use the Document Analyzer interface..."
                    : "Enter your prompt or ask for prompt assistance..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="chat-input-buttons">
                <Button variant="ghost" size="icon" className="chat-input-button">
                  <Mic className="h-5 w-5 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`chat-input-button ${inputValue.trim() ? "glow-button" : ""}`}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className={`h-5 w-5 ${inputValue.trim() ? "text-blue-500" : "text-gray-400"}`} />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs flex items-center gap-1 hover:bg-gray-50/50 transition-smooth border footer-agents-button ${
                      currentAgent.id === "enhancer" 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                        : currentAgent.id === "analyzer"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : currentAgent.id === "handwriting"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : currentAgent.id === "document-analyzer"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-white/50 border-gray-200/30"
                    }`}
                    onClick={toggleFooterAgents}
                  >
                    <div className={`w-4 h-4 ${currentAgent.color} rounded-md flex items-center justify-center mr-1`}>
                      {currentAgent.icon}
                    </div>
                    {currentAgent.name}
                    <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
                  </Button>

                  {showFooterAgents && (
                    <div className="footer-agents-dropdown">
                      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100/20">
                        <h3 className="font-medium text-sm">Select AI Agent</h3>
                      </div>
                      <div className="p-2">
                        {agents.map((agent) => (
                          <div
                            key={agent.id}
                            className={`agent-option ${currentAgent.id === agent.id ? "active" : ""}`}
                            onClick={() => selectAgent(agent)}
                          >
                            <div className={`w-6 h-6 ${agent.color} rounded-md flex items-center justify-center`}>
                              {agent.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{agent.name}</div>
                              <div className="text-xs text-gray-500">{agent.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Handwriting Tools Dropdown */}
                {currentAgent.id === "handwriting" && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex items-center gap-1 hover:bg-green-50/50 transition-smooth border handwriting-tools-button bg-green-50 text-green-700 border-green-200"
                      onClick={toggleHandwritingTools}
                    >
                      <PenTool className="h-3 w-3" />
                      Tools
                      <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
                    </Button>

                    {showHandwritingTools && (
                      <div className="footer-agents-dropdown handwriting-tools-dropdown">
                        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100/20">
                          <h3 className="font-medium text-sm">Writing Tools</h3>
                        </div>
                        <div className="p-2">
                          {handwritingTools.map((tool) => (
                            <div
                              key={tool.id}
                              className="agent-option"
                              onClick={() => selectHandwritingTool(tool.id)}
                            >
                              <div className={`w-6 h-6 ${tool.color} rounded-md flex items-center justify-center text-white`}>
                                {tool.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{tool.name}</div>
                                <div className="text-xs text-gray-500">{tool.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}