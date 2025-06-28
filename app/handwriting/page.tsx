"use client"

import React, { useState } from "react"
import { PenTool, ArrowRight, FileText, BookOpen, Home, Wand2, CheckCircle, Scissors, Copy, Loader2, Sparkles, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { processHandwriting } from "@/lib/groq-service"

export default function HandwritingPage() {
  const [tool1Input, setTool1Input] = useState("")
  const [tool1Output, setTool1Output] = useState("")
  const [tool1Loading, setTool1Loading] = useState(false)

  const [tool2Input, setTool2Input] = useState("")
  const [tool2Output, setTool2Output] = useState("")
  const [tool2Loading, setTool2Loading] = useState(false)

  const [tool3Input, setTool3Input] = useState("")
  const [tool3Output, setTool3Output] = useState("")
  const [tool3Loading, setTool3Loading] = useState(false)

  const handleTool1Process = async () => {
    if (!tool1Input.trim()) return
    setTool1Loading(true)
    try {
      const result = await processHandwriting(tool1Input, "continue")
      if (result.processedText) {
        setTool1Output(result.processedText)
      }
    } catch (error) {
      console.error("Error:", error)
      setTool1Output("Error processing text. Please try again.")
    } finally {
      setTool1Loading(false)
    }
  }

  const handleTool2Process = async () => {
    if (!tool2Input.trim()) return
    setTool2Loading(true)
    try {
      const result = await processHandwriting(tool2Input, "grammar")
      if (result.processedText) {
        setTool2Output(result.processedText)
      }
    } catch (error) {
      console.error("Error:", error)
      setTool2Output("Error processing text. Please try again.")
    } finally {
      setTool2Loading(false)
    }
  }

  const handleTool3Process = async () => {
    if (!tool3Input.trim()) return
    setTool3Loading(true)
    try {
      const result = await processHandwriting(tool3Input, "summarize")
      if (result.processedText) {
        setTool3Output(result.processedText)
      }
    } catch (error) {
      console.error("Error:", error)
      setTool3Output("Error processing text. Please try again.")
    } finally {
      setTool3Loading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-75"></div>
              <div className="relative p-4 bg-white rounded-full shadow-xl">
                <PenTool className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Writing Studio
              </h1>
              <p className="text-lg text-gray-600 mt-1">Professional writing tools powered by artificial intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Professional Quality</span>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-200 shadow-sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Main App
            </Button>
          </Link>
        </div>

        {/* Enhanced Three-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Tool 1: Continue Writing */}
          <Card className="group border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
            <CardHeader className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Continue Writing</CardTitle>
                  <CardDescription className="text-blue-100 text-sm">
                    AI continues your text naturally
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Style Analysis
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Natural Flow
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-blue-500" />
                  Your Text
                </Label>
                <Textarea
                  placeholder="Start writing something and AI will continue it naturally, maintaining your unique style and voice..."
                  className="min-h-[140px] resize-none border-blue-200 focus:border-blue-400 text-sm leading-relaxed bg-white/80 backdrop-blur-sm"
                  value={tool1Input}
                  onChange={(e) => setTool1Input(e.target.value)}
                />
                {tool1Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {tool1Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {tool1Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool1Process}
                disabled={!tool1Input.trim() || tool1Loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {tool1Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing & Continuing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Continue Writing
                  </>
                )}
              </Button>

              {tool1Output && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    AI Continuation
                  </Label>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-inner">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool1Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool1Output)}
                    className="w-full flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 2: Grammar Fixer */}
          <Card className="group border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <CardHeader className="relative bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Grammar Fixer</CardTitle>
                  <CardDescription className="text-emerald-100 text-sm">
                    Fix grammar, spelling & style
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Error Detection
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Style Enhancement
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Text to Fix
                </Label>
                <Textarea
                  placeholder="Paste text with grammar issues here and AI will fix them while preserving your original meaning..."
                  className="min-h-[140px] resize-none border-emerald-200 focus:border-emerald-400 text-sm leading-relaxed bg-white/80 backdrop-blur-sm"
                  value={tool2Input}
                  onChange={(e) => setTool2Input(e.target.value)}
                />
                {tool2Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {tool2Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {tool2Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool2Process}
                disabled={!tool2Input.trim() || tool2Loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {tool2Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing & Fixing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Fix Grammar
                  </>
                )}
              </Button>

              {tool2Output && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Fixed Text
                  </Label>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-inner">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool2Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool2Output)}
                    className="w-full flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 3: Text Summarizer */}
          <Card className="group border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardHeader className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Scissors className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Text Summarizer</CardTitle>
                  <CardDescription className="text-purple-100 text-sm">
                    Create concise summaries
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Key Extraction
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Smart Compression
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  Long Text
                </Label>
                <Textarea
                  placeholder="Paste long text here to create a summary or shortened version while preserving key information..."
                  className="min-h-[140px] resize-none border-purple-200 focus:border-purple-400 text-sm leading-relaxed bg-white/80 backdrop-blur-sm"
                  value={tool3Input}
                  onChange={(e) => setTool3Input(e.target.value)}
                />
                {tool3Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {tool3Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {tool3Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool3Process}
                disabled={!tool3Input.trim() || tool3Loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {tool3Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing & Summarizing...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Summarize Text
                  </>
                )}
              </Button>

              {tool3Output && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Summary
                  </Label>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-inner">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool3Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool3Output)}
                    className="w-full flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">AI Processing Active</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Instant Results</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Professional Quality</span>
            </div>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="group text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Continue Writing</h3>
            <p className="text-gray-600 leading-relaxed">AI analyzes your writing style and continues naturally, maintaining your unique voice and creative flow.</p>
          </div>
          
          <div className="group text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Grammar Fixer</h3>
            <p className="text-gray-600 leading-relaxed">Fix grammar, spelling, punctuation, and improve sentence structure while preserving your original meaning.</p>
          </div>
          
          <div className="group text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Text Summarizer</h3>
            <p className="text-gray-600 leading-relaxed">Create concise summaries or shorten text while preserving essential information and key insights.</p>
          </div>
        </div>
      </div>
    </div>
  )
}