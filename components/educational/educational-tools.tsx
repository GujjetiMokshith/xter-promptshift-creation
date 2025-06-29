"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  GraduationCap, 
  MessageSquare, 
  Brain, 
  ArrowRight, 
  BookOpen,
  Sparkles,
  Target,
  Trophy,
  Users,
  Clock
} from "lucide-react"
import { AIChatTutor } from "./ai-chat-tutor"
import { AIQuizGenerator } from "./ai-quiz-generator"

interface EducationalToolsProps {
  onBackToMain?: () => void
}

export function EducationalTools({ onBackToMain }: EducationalToolsProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools = [
    {
      id: "chat-tutor",
      name: "AI Chat Tutor",
      icon: <MessageSquare className="h-6 w-6" />,
      description: "Interactive AI tutor that teaches any topic with friendly, emoji-enhanced conversations",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      features: [
        "📚 Learn any subject interactively",
        "🎯 Personalized explanations",
        "😊 Friendly, engaging conversations",
        "🧠 Adaptive difficulty levels"
      ],
      component: <AIChatTutor onBackToMain={() => setActiveTool(null)} />
    },
    {
      id: "quiz-generator",
      name: "AI Quiz Generator",
      icon: <Brain className="h-6 w-6" />,
      description: "Generate custom quizzes on any topic with multiple question types and instant feedback",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      features: [
        "🎯 Custom topic quizzes",
        "📝 Multiple question types",
        "⚡ Instant feedback",
        "📊 Detailed performance analytics"
      ],
      component: <AIQuizGenerator onBackToMain={() => setActiveTool(null)} />
    }
  ]

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Back to Educational Tools
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                {tool?.icon}
                <h1 className="text-2xl font-bold text-gray-900">{tool?.name}</h1>
              </div>
            </div>
            {onBackToMain && (
              <Button
                variant="ghost"
                onClick={onBackToMain}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Main Menu
              </Button>
            )}
          </div>

          {/* Tool component */}
          <div className="max-w-6xl mx-auto">
            {tool?.component}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Educational Tools</h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered learning tools to help you master any subject with interactive tutoring and custom quizzes
          </p>
          {onBackToMain && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" onClick={onBackToMain} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Main App
              </Button>
            </div>
          )}
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${tool.borderColor} border-2`}
              onClick={() => setActiveTool(tool.id)}
            >
              <CardHeader className={`${tool.bgColor} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className={`p-3 ${tool.color} text-white rounded-lg`}>
                    {tool.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mt-4">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full mt-6 ${tool.color} ${tool.hoverColor} text-white`}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    Open {tool.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete Learning Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Learning</h3>
              <p className="text-gray-600">Engage with AI tutors for personalized, conversational learning experiences.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Quizzes</h3>
              <p className="text-gray-600">Generate custom quizzes with AI that adapt to your learning needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600">Adaptive difficulty and personalized explanations for optimal learning.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your learning progress with detailed analytics and feedback.</p>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose AI-Powered Learning?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">Available anytime for learning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">∞</div>
              <div className="text-gray-600">Unlimited topics and subjects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">🎯</div>
              <div className="text-gray-600">Personalized to your pace</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}