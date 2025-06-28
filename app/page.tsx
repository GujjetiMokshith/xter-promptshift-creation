// @ts-nocheck
"use client"

import React, { useState, useRef, useEffect } from "react"
// Make sure CSS is imported
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
  PenTool,
  LineChart,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { analyzePrompt, enhancePrompt, generatePrompts } from "@/lib/grok-service"
import { useSearchParams, useRouter } from "next/navigation"

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
}

interface Agent {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

interface PromptHistory {
  id: string
  content: string
  timestamp: Date
}

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State for messages in current chat
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // State for chat history
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // State for sidebar functionality
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // State for footer dropdowns
  const [showFooterAgents, setShowFooterAgents] = useState(false)

  // State for AI agents
  const [currentAgent, setCurrentAgent] = useState<Agent>({
    id: "enhancer",
    name: "Prompt Enhancer",
    icon: <Wand2 size={14} className="text-white" />,
    description: "Automatically rewrites prompts to be more detailed, creative, or direct.",
    color: "bg-indigo-500",
  })

  // State for prompt history
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([])

  // State for hydration
  const [isHydrated, setIsHydrated] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample AI agents
  const agents: Agent[] = [
    {
      id: "enhancer",
      name: "Prompt Enhancer",
      icon: <Wand2 size={14} className="text-white" />,
      description: "Automatically rewrites prompts to be more detailed, creative, or direct.",
      color: "bg-indigo-500",
    },
    {
      id: "generator",
      name: "Prompt Generator",
      icon: <PenTool size={14} className="text-white" />,
      description: "Generates new prompts based on a topic, keyword, or goal.",
      color: "bg-emerald-500",
    },
    {
      id: "analyzer",
      name: "Prompt Analyzer",
      icon: <LineChart size={14} className="text-white" />,
      description: "Rates prompt quality based on clarity, specificity, and effectiveness.",
      color: "bg-amber-500",
    },
  ]

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    if (isHydrated) {
      inputRef.current?.focus()
    }
  }, [isHydrated])

  // Load chats from localStorage on initial load
  useEffect(() => {
    if (!isHydrated) return

    const savedChats = localStorage.getItem("typingmind-chats")
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats)
        setChats(parsedChats)

        // If there are chats, set the current chat to the most recent one
        if (parsedChats.length > 0) {
          const mostRecentChat = parsedChats.sort(
            (a: Chat, b: Chat) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0]
          setCurrentChatId(mostRecentChat.id)
          setMessages(mostRecentChat.messages)
        }
      } catch (error) {
        console.error("Error parsing saved chats:", error)
      }
    }
  }, [isHydrated])

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (isHydrated && chats.length > 0) {
      localStorage.setItem("typingmind-chats", JSON.stringify(chats))
    }
  }, [chats, isHydrated])

  // Update current chat in chats array whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats((prevChats) => prevChats.map((chat) => (chat.id === currentChatId ? { ...chat, messages } : chat)))
    }
  }, [messages, currentChatId])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".footer-agents-dropdown") && !target.closest(".footer-agents-button")) {
        setShowFooterAgents(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Check URL parameters to select the correct agent
  useEffect(() => {
    if (!isHydrated) return

    const agentParam = searchParams.get("agent")
    if (agentParam) {
      const selectedAgent = agents.find(agent => agent.id === agentParam)
      if (selectedAgent) {
        setCurrentAgent(selectedAgent)
      }
    }
  }, [searchParams, isHydrated])

  const handleSendMessage = async () => {
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
    setPromptHistory((prev) => [newPrompt, ...prev.slice(0, 49)]) // Keep only the last 50 prompts

    setInputValue("")

    // Simulate AI typing
    setIsTyping(true)

    try {
      // Use the Grok API based on the current agent
      let response

      switch (currentAgent.id) {
        case "enhancer":
          response = await enhancePrompt(inputValue).catch(error => {
            console.error("Error enhancing prompt:", error);
            return { text: "I encountered an error while enhancing your prompt.", enhancedPrompts: [] };
          });
          break;
        case "generator":
          response = await generatePrompts(inputValue).catch(error => {
            console.error("Error generating prompts:", error);
            return { text: "I encountered an error while generating prompts.", generatedPrompts: [] };
          });
          break;
        case "analyzer":
          response = await analyzePrompt(inputValue).catch(error => {
            console.error("Error analyzing prompt:", error);
            return { text: "I encountered an error while analyzing your prompt.", analysis: { score: 0, strengths: [], weaknesses: [], suggestions: [] } };
          });
          break;
        default:
          response = { text: "I'm not sure how to process that request." };
      }

      // Format the response based on the agent type
      let responseText = ""

      if (currentAgent.id === "enhancer" && response.enhancedPrompts) {
        responseText = `Here are some enhanced versions of your prompt:\n\n${response.enhancedPrompts.map((p, i) => `${i + 1}. "${p}"`).join("\n\n")}`
      } else if (currentAgent.id === "generator" && response.generatedPrompts) {
        responseText = `Based on your topic, here are some prompt ideas:\n\n${response.generatedPrompts.map((p, i) => `${i + 1}. "${p}"`).join("\n\n")}`
      } else if (currentAgent.id === "analyzer" && response.analysis) {
        const { score, strengths, weaknesses, suggestions } = response.analysis
        responseText = `Prompt Analysis Score: ${score}/100\n\n## Strengths\n${strengths.map((s) => `- ${s}`).join("\n")}\n\n## Areas for improvement\n${weaknesses.map((w) => `- ${w}`).join("\n")}\n\n## Suggestions\n${suggestions.map((s) => `- ${s}`).join("\n")}`
      } else {
        responseText = response.text || "I processed your request but couldn't generate a proper response."
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: "ai",
        timestamp: new Date(),
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1000) // Small delay for natural feel
    } catch (error) {
      console.error("Error processing with Grok API:", error)

      // Fallback response
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
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const createNewChat = () => {
    // Create a new chat
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

    // Focus the input
    if (isHydrated) {
      inputRef.current?.focus()
    }
  }

  const selectChat = (chatId: string) => {
    const selectedChat = chats.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChatId(chatId)
      setMessages(selectedChat.messages)
      setShowChatHistory(false)
    }
  }

  const selectAgent = (agent: Agent) => {
    if (agent) {
    setCurrentAgent(agent)
    setShowFooterAgents(false)
      
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
      if (isHydrated) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    if (isHydrated) {
      inputRef.current?.focus()
    }
  }

  const toggleFooterAgents = () => {
    setShowFooterAgents(!showFooterAgents)
  }

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return null
  }

  return (
    <div className="app-container">
      {/* Transparent sidebar with tooltips */}
      <TooltipProvider delayDuration={300}>
        <div className="sidebar">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full mb-4 hover:bg-gray-100/10 transition-smooth"
                onClick={createNewChat}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex flex-col items-center gap-8 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`sidebar-icon transition-smooth ${showChatHistory ? "active" : ""}`}
                  onClick={() => {
                    setShowChatHistory(!showChatHistory)
                  }}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Chat History</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-icon transition-smooth">
                  <Settings className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-4 relative">
            <div
              className="w-8 h-8 bg-gray-200/20 rounded-full flex items-center justify-center transition-smooth hover:bg-gray-300/20 cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="text-sm font-medium">U</span>
            </div>

            {showProfileMenu && (
              <div className="sidebar-dropdown">
                <div className="sidebar-dropdown-item">
                  <User size={16} />
                  <span>Profile</span>
                </div>
                <div className="sidebar-dropdown-item">
                  <Settings size={16} />
                  <span>Settings</span>
                </div>
                {/* Sign Out option removed since authentication is disabled */}
              </div>
            )}
          </div>
        </div>

        {/* Chat History Dropdown */}
        {showChatHistory && (
          <div className="sidebar-dropdown mt-16">
            <div className="flex justify-between items-center px-2 pb-2 border-b border-gray-100/20">
              <h3 className="font-medium text-sm">Recent Chats</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={createNewChat}>
                <Plus className="h-3 w-3 mr-1" /> New
              </Button>
            </div>
            <div className="chat-history-list">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-history-item ${currentChatId === chat.id ? "active" : ""}`}
                    onClick={() => selectChat(chat.id)}
                  >
                    <MessageSquare size={16} />
                    <div className="flex-1 truncate">{chat.title || "New Chat"}</div>
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
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium">Your Prompt Tools</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "enhancer"))}
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
                    onClick={() => selectAgent(agents.find(agent => agent.id === "generator"))}
                  >
                      <div className="agent-icon bg-emerald-100">
                        <PenTool size={16} className="text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Prompt Generator</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Generates new prompts based on topics or goals. Offers use-case templates for various AI
                          platforms.
                        </p>
                      </div>
                    </div>

                  <div 
                    className="agent-card transition-smooth cursor-pointer"
                    onClick={() => selectAgent(agents.find(agent => agent.id === "analyzer"))}
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

                  <div className="agent-card transition-smooth cursor-pointer">
                    <div className="agent-icon bg-blue-100">
                      <Sparkles size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Free And Unlimited</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        No usage limits or restrictions. Use all features freely without any hidden costs.
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
                        currentAgent.id === "generator" ? "text-emerald-500" : 
                        currentAgent.id === "analyzer" ? "text-amber-500" : "text-indigo-500"
                      }`}>A</span>
                    </div>
                  )}
                  <div className="message-content">
                    <div className="whitespace-pre-wrap">
                      {message.content.split('\n').map((line, i) => {
                        // For prompt suggestions (numbered with quotes)
                        if (/^\d+\.\s+\".*\"$/.test(line)) {
                          const promptText = line.match(/\"(.*)\"/)?.[1] || "";
                          return (
                            <div key={i} className="prompt-suggestion">
                              {line.split('"')[0]}
                              <span className="prompt-text">{promptText}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="copy-button ml-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(promptText);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
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
                    : currentAgent.id === "generator" 
                    ? "Enter a topic to generate prompts for..." 
                    : currentAgent.id === "analyzer"
                    ? "Enter a prompt to analyze..." 
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
                        : currentAgent.id === "generator"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : currentAgent.id === "analyzer"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}