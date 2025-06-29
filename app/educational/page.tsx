"use client"

import React, { useState } from "react"
import { GraduationCap, ArrowRight, Brain, BookOpen, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AIChatTutor } from "@/components/educational/ai-chat-tutor"
import { AIQuizGenerator } from "@/components/educational/ai-quiz-generator"

export default function EducationalPage() {
  const [activeSubTool, setActiveSubTool] = useState<string | null>(null)

  const subTools = [
    {
      id: "ai-tutor",
      name: "AI Chat Tutor",
      icon: <GraduationCap className="h-6 w-6" />,
      description: "Interactive AI tutor that teaches any topic in a friendly and engaging manner with emoji-enhanced conversations.",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      component: <AIChatTutor />
    },
    {
      id: "quiz-generator",
      name: "AI Quiz Generator",
      icon: <Brain className="h-6 w-6" />,
      description: "Automatically generates custom quizzes with multiple question types to test your knowledge effectively.",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      component: <AIQuizGenerator />
    }
  ]

  if (activeSubTool) {
    const tool = subTools.find(t => t.id === activeSubTool)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveSubTool(null)}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Back to Tools
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                {tool?.icon}
                <h1 className="text-2xl font-bold text-gray-900">{tool?.name}</h1>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
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
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Educational Tools</h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered learning tools to help you study, practice, and master any subject with interactive tutoring and custom quizzes
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Main App
              </Button>
            </Link>
          </div>
        </div>

        {/* Sub-tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {subTools.map((tool) => (
            <Card 
              key={tool.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${tool.borderColor} border-2`}
              onClick={() => setActiveSubTool(tool.id)}
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
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI-Powered Learning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Interactive Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Personalized Content</span>
                  </div>
                  
                  <Button 
                    className={`w-full mt-6 ${tool.color} ${tool.hoverColor} text-white`}
                    onClick={() => setActiveSubTool(tool.id)}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Complete Learning Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chat Tutor</h3>
              <p className="text-gray-600">Get personalized explanations and learn any topic with an AI tutor that adapts to your learning style and uses engaging emojis to make learning fun.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Generator</h3>
              <p className="text-gray-600">Create custom quizzes on any topic with multiple question types, difficulty levels, and detailed explanations to test and reinforce your knowledge.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}