"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Sparkles, 
  Wand2, 
  FileText, 
  PenTool, 
  ChevronDown,
  GraduationCap,
  Brain,
  Zap,
  Target,
  Lightbulb,
  BookOpen,
  Palette,
  Search,
  BarChart3,
  Microscope,
  Calculator,
  Globe,
  Code,
  Atom,
  Beaker,
  Telescope,
  Music,
  Brush,
  Camera,
  Gamepad2,
  Heart,
  Leaf,
  Star,
  Rocket,
  Crown,
  Diamond,
  Flame,
  Shield,
  Trophy,
  Magic,
  Compass,
  Eye,
  Fingerprint,
  Cpu,
  Database,
  Network,
  Settings,
  Layers,
  Grid,
  Puzzle,
  Lock,
  Key,
  Gem,
  Coins,
  TrendingUp,
  Activity,
  BarChart,
  PieChart,
  LineChart,
  Radar,
  Gauge,
  Timer,
  Clock,
  Calendar,
  MapPin,
  Navigation,
  Compass as CompassIcon,
  Mountain,
  Waves,
  Sun,
  Moon,
  Cloud,
  Snowflake,
  Umbrella,
  Rainbow,
  Flower,
  Tree,
  Butterfly,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Bear,
  Lion,
  Elephant,
  Turtle,
  Octopus,
  Crab,
  Snail,
  Bee,
  Ladybug,
  Spider,
  Ant,
  Worm,
  Feather,
  Egg,
  Seed,
  Sprout,
  Cactus,
  Mushroom,
  Cherry,
  Apple,
  Banana,
  Grape,
  Orange,
  Lemon,
  Strawberry,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Carrot,
  Corn,
  Pepper,
  Tomato,
  Potato,
  Onion,
  Garlic,
  Bread,
  Cheese,
  Milk,
  Coffee,
  Tea,
  Wine,
  Beer,
  Cocktail,
  IceCream,
  Cookie,
  Cake,
  Pizza,
  Hamburger,
  Sandwich,
  Taco,
  Sushi,
  Ramen,
  Soup,
  Salad,
  Pasta,
  Rice,
  Meat,
  Chicken,
  Fish as FishIcon,
  Shrimp,
  Lobster,
  Crab as CrabIcon,
  Oyster,
  Clam,
  Squid,
  Octopus as OctopusIcon,
  Jellyfish,
  Shark,
  Whale,
  Dolphin,
  Seal,
  Penguin,
  Polar,
  Koala,
  Panda,
  Monkey,
  Gorilla,
  Tiger,
  Leopard,
  Cheetah,
  Zebra,
  Giraffe,
  Hippo,
  Rhino,
  Camel,
  Horse,
  Cow,
  Pig,
  Sheep,
  Goat,
  Deer,
  Moose,
  Wolf,
  Fox,
  Raccoon,
  Squirrel,
  Hedgehog,
  Bat,
  Owl,
  Eagle,
  Hawk,
  Parrot,
  Flamingo,
  Swan,
  Duck,
  Goose,
  Chicken as ChickenIcon,
  Rooster,
  Turkey,
  Peacock,
  Dove,
  Crow,
  Robin,
  Sparrow,
  Hummingbird,
  Woodpecker,
  Pelican,
  Stork,
  Crane,
  Heron,
  Ibis,
  Spoonbill,
  Kingfisher,
  Bee as BeeIcon,
  Wasp,
  Hornet,
  Fly,
  Mosquito,
  Gnat,
  Midge,
  Tick,
  Flea,
  Louse,
  Mite,
  Chigger,
  Bedbug,
  Cockroach,
  Termite,
  Carpenter,
  Weevil,
  Aphid,
  Scale,
  Whitefly,
  Thrips,
  Leafhopper,
  Planthopper,
  Cicada,
  Cricket,
  Grasshopper,
  Locust,
  Katydid,
  Mantis,
  Walkingstick,
  Earwig,
  Silverfish,
  Firebrat,
  Springtail,
  Bristletail,
  Mayfly,
  Dragonfly,
  Damselfly,
  Stonefly,
  Caddisfly,
  Lacewing,
  Antlion,
  Dobsonfly,
  Fishfly,
  Alderfly,
  Snakefly,
  Scorpionfly,
  Hangingfly,
  Bittacus,
  Boreus,
  Mecoptera,
  Siphonaptera,
  Strepsiptera,
  Embioptera,
  Zoraptera,
  Grylloblattodea,
  Mantophasmatodea,
  Phasmatodea,
  Orthoptera,
  Dermaptera,
  Plecoptera,
  Ephemeroptera,
  Odonata,
  Neuroptera,
  Megaloptera,
  Raphidioptera,
  Mecoptera as MecopteraIcon,
  Siphonaptera as SiphonapteraIcon,
  Strepsiptera as StrepsipteraIcon,
  Embioptera as EmbiopteraIcon,
  Zoraptera as ZorapteraIcon,
  Grylloblattodea as GrylloblattodeaIcon,
  Mantophasmatodea as MantophasmatodeaIcon
} from "lucide-react"
import { PromptEnhancer } from "@/components/prompt-enhancer"
import { DocumentAnalyzer } from "@/components/document-analyzer"
import { HandwritingAssistant } from "@/components/handwriting-assistant"
import { AIChatTutor } from "@/components/handwriting/ai-chat-tutor"
import { AIQuizGenerator } from "@/components/handwriting/ai-quiz-generator"
import Link from "next/link"

interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  bgColor: string
  borderColor: string
  hoverColor: string
  gradient: string
  shadowColor: string
}

interface Tool {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  component: React.ReactNode
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("enhancer")
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [showHandwritingTools, setShowHandwritingTools] = useState(false)
  const [showEducationalTools, setShowEducationalTools] = useState(false)
  const [selectedHandwritingTool, setSelectedHandwritingTool] = useState<string | null>(null)
  const [selectedEducationalTool, setSelectedEducationalTool] = useState<string | null>(null)
  const [showMainInterface, setShowMainInterface] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const agents: Agent[] = [
    {
      id: "enhancer",
      name: "Prompt Enhancer",
      icon: <div className="relative">
        <Wand2 className="h-5 w-5" />
        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-400" />
      </div>,
      description: "Transform basic prompts into powerful, detailed instructions",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      hoverColor: "hover:bg-indigo-100",
      gradient: "from-indigo-500 to-purple-600",
      shadowColor: "shadow-indigo-200"
    },
    {
      id: "analyzer",
      name: "Document Analyzer",
      icon: <div className="relative">
        <FileText className="h-5 w-5" />
        <Search className="h-3 w-3 absolute -bottom-1 -right-1 text-emerald-400" />
      </div>,
      description: "AI-powered document analysis, summaries, and insights",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-100",
      gradient: "from-orange-500 to-red-500",
      shadowColor: "shadow-orange-200"
    },
    {
      id: "handwriting",
      name: "Handwriting Tools",
      icon: <div className="relative">
        <PenTool className="h-5 w-5" />
        <Palette className="h-3 w-3 absolute -top-1 -right-1 text-green-400" />
      </div>,
      description: "AI writing assistance and digital handwriting canvas",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
      gradient: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-200"
    },
    {
      id: "educational",
      name: "Educational Tools",
      icon: <div className="relative">
        <GraduationCap className="h-5 w-5" />
        <Brain className="h-3 w-3 absolute -top-1 -right-1 text-blue-400" />
      </div>,
      description: "AI tutoring and interactive learning experiences",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-200"
    }
  ]

  const handwritingTools: Tool[] = [
    {
      id: "continue",
      name: "Continue Writing",
      icon: <div className="relative">
        <Zap className="h-5 w-5" />
        <Target className="h-3 w-3 absolute -bottom-1 -right-1 text-blue-400" />
      </div>,
      description: "AI continues your text naturally",
      color: "text-blue-600",
      component: <div>Continue Writing Tool</div>
    },
    {
      id: "grammar",
      name: "Grammar Fixer",
      icon: <div className="relative">
        <Shield className="h-5 w-5" />
        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-emerald-400" />
      </div>,
      description: "Fix grammar and improve style",
      color: "text-emerald-600",
      component: <div>Grammar Fixer Tool</div>
    },
    {
      id: "summarize",
      name: "Text Summarizer",
      icon: <div className="relative">
        <BarChart3 className="h-5 w-5" />
        <Lightbulb className="h-3 w-3 absolute -top-1 -right-1 text-purple-400" />
      </div>,
      description: "Summarize and shorten text",
      color: "text-purple-600",
      component: <div>Text Summarizer Tool</div>
    },
    {
      id: "canvas",
      name: "Drawing Canvas",
      icon: <div className="relative">
        <Brush className="h-5 w-5" />
        <Palette className="h-3 w-3 absolute -bottom-1 -right-1 text-orange-400" />
      </div>,
      description: "Digital handwriting canvas",
      color: "text-orange-600",
      component: <div>Drawing Canvas Tool</div>
    }
  ]

  const educationalTools: Tool[] = [
    {
      id: "tutor",
      name: "AI Chat Tutor",
      icon: <div className="relative">
        <GraduationCap className="h-5 w-5" />
        <Heart className="h-3 w-3 absolute -top-1 -right-1 text-pink-400" />
      </div>,
      description: "Personal AI tutor for any subject",
      color: "text-blue-600",
      component: <AIChatTutor />
    },
    {
      id: "quiz",
      name: "Quiz Generator",
      icon: <div className="relative">
        <Brain className="h-5 w-5" />
        <Trophy className="h-3 w-3 absolute -bottom-1 -right-1 text-yellow-400" />
      </div>,
      description: "Create custom quizzes and tests",
      color: "text-purple-600",
      component: <AIQuizGenerator />
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAgentDropdown) {
        setShowAgentDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAgentDropdown])

  useEffect(() => {
    if (selectedAgent === "handwriting") {
      setShowHandwritingTools(true)
      setShowEducationalTools(false)
    } else if (selectedAgent === "educational") {
      setShowEducationalTools(true)
      setShowHandwritingTools(false)
    } else {
      setShowHandwritingTools(false)
      setShowEducationalTools(false)
    }
  }, [selectedAgent])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I understand you want to work with the ${agents.find(a => a.id === selectedAgent)?.name}. This is a simulated response for demonstration purposes.`,
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId)
    setShowAgentDropdown(false)
    setSelectedHandwritingTool(null)
    setSelectedEducationalTool(null)
    setShowMainInterface(true)
  }

  const handleToolSelect = (toolId: string, toolType: "handwriting" | "educational") => {
    if (toolType === "handwriting") {
      setSelectedHandwritingTool(toolId)
      setShowMainInterface(false)
    } else {
      setSelectedEducationalTool(toolId)
      setShowMainInterface(false)
    }
  }

  const handleBackToMain = () => {
    setSelectedHandwritingTool(null)
    setSelectedEducationalTool(null)
    setShowMainInterface(true)
  }

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent)

  // Render individual tool interfaces
  if (!showMainInterface) {
    if (selectedHandwritingTool) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToMain}
                  className="flex items-center gap-2"
                >
                  <PenTool className="h-4 w-4" />
                  Back to Chat
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  {handwritingTools.find(t => t.id === selectedHandwritingTool)?.icon}
                  <h1 className="text-2xl font-bold text-gray-900">
                    {handwritingTools.find(t => t.id === selectedHandwritingTool)?.name}
                  </h1>
                </div>
              </div>
              <Link href="/handwriting">
                <Button variant="ghost" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Full Handwriting Suite
                </Button>
              </Link>
            </div>
            <HandwritingAssistant />
          </div>
        </div>
      )
    }

    if (selectedEducationalTool) {
      const tool = educationalTools.find(t => t.id === selectedEducationalTool)
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToMain}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Back to Chat
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  {tool?.icon}
                  <h1 className="text-2xl font-bold text-gray-900">{tool?.name}</h1>
                </div>
              </div>
            </div>
            <div className="max-w-6xl mx-auto">
              {tool?.component}
            </div>
          </div>
        </div>
      )
    }
  }

  // Render specific agent interfaces
  if (selectedAgent === "enhancer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Wand2 className="h-6 w-6 text-indigo-600" />
                <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Prompt Enhancer</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedAgent("enhancer")}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Back to Chat
            </Button>
          </div>
          <PromptEnhancer />
        </div>
      </div>
    )
  }

  if (selectedAgent === "analyzer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <DocumentAnalyzer onBackToMain={() => setSelectedAgent("analyzer")} />
        </div>
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <TooltipProvider>
          <div className="tooltip-wrapper">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-icon active">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Chat Interface</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="tooltip-wrapper">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/handwriting">
                  <div className="sidebar-icon">
                    <div className="relative">
                      <PenTool className="h-5 w-5" />
                      <Palette className="h-3 w-3 absolute -top-1 -right-1 text-green-400" />
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Handwriting Suite</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Main Content */}
      <div className="content-area blue-glow-top">
        <div className="chat-container">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="info-icon">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">TypingMind</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your intelligent AI assistant for enhanced productivity and creativity
            </p>
          </div>

          {/* Agent Selection */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <button
                onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedAgentData?.borderColor} ${selectedAgentData?.bgColor} ${selectedAgentData?.hoverColor}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedAgentData?.gradient} text-white shadow-lg ${selectedAgentData?.shadowColor}`}>
                    {selectedAgentData?.icon}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold ${selectedAgentData?.color}`}>
                      {selectedAgentData?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedAgentData?.description}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAgentDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={`w-full flex items-center gap-3 p-4 transition-all ${agent.hoverColor} ${selectedAgent === agent.id ? agent.bgColor : ''}`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${agent.gradient} text-white shadow-lg ${agent.shadowColor}`}>
                        {agent.icon}
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold ${agent.color}`}>
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tool Selection Dropdowns */}
          {showHandwritingTools && (
            <div className="mb-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                  <PenTool className="h-5 w-5 text-green-600" />
                  Choose Handwriting Tool
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handwritingTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id, "handwriting")}
                      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg group-hover:shadow-green-200">
                        {tool.icon}
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold ${tool.color}`}>
                          {tool.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showEducationalTools && (
            <div className="mb-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Choose Educational Tool
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationalTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id, "educational")}
                      className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg group-hover:shadow-blue-200">
                        {tool.icon}
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold ${tool.color}`}>
                          {tool.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 mb-6">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="info-icon">
                  {selectedAgentData?.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to help with {selectedAgentData?.name}
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  {selectedAgentData?.description}
                </p>
                {(selectedAgent === "handwriting" || selectedAgent === "educational") && (
                  <p className="text-sm text-gray-500">
                    Select a tool above to get started, or type a message to begin a conversation.
                  </p>
                )}
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.role === "user" ? "message-user" : "message-ai"}`}
                    >
                      <div className="message-avatar">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="message-content">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input Area */}
          <div className="footer">
            <div className="relative max-w-4xl mx-auto">
              <Input
                ref={inputRef}
                placeholder={`Message ${selectedAgentData?.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="chat-input"
              />
              <div className="chat-input-buttons">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="chat-input-button bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}