"use client"

import React, { useState } from "react"
import { PenTool, ArrowRight, FileText, BookOpen, Home, Wand2, CheckCircle, Scissors, Copy, Loader2 } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <PenTool className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Handwriting Assistant</h1>
              <p className="text-gray-600">AI-powered writing tools for all your content needs</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Main App
            </Button>
          </Link>
        </div>

        {/* Three-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tool 1: Continue Writing */}
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Continue Writing</CardTitle>
              </div>
              <CardDescription className="text-blue-700">
                AI analyzes your style and continues naturally
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Your Text</Label>
                <Textarea
                  placeholder="Start writing something and AI will continue it naturally..."
                  className="min-h-[140px] resize-none border-blue-200 focus:border-blue-400 text-sm leading-relaxed"
                  value={tool1Input}
                  onChange={(e) => setTool1Input(e.target.value)}
                />
                {tool1Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tool1Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tool1Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool1Process}
                disabled={!tool1Input.trim() || tool1Loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                size="lg"
              >
                {tool1Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Continuing...
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
                  <Label className="text-sm font-semibold text-green-700">AI Continuation</Label>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool1Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool1Output)}
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 2: Grammar Fixer */}
          <Card className="border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-emerald-900">Grammar Fixer</CardTitle>
              </div>
              <CardDescription className="text-emerald-700">
                Fix grammar, spelling & improve style
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Text to Fix</Label>
                <Textarea
                  placeholder="Paste text with grammar issues here and AI will fix them..."
                  className="min-h-[140px] resize-none border-emerald-200 focus:border-emerald-400 text-sm leading-relaxed"
                  value={tool2Input}
                  onChange={(e) => setTool2Input(e.target.value)}
                />
                {tool2Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tool2Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tool2Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool2Process}
                disabled={!tool2Input.trim() || tool2Loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                size="lg"
              >
                {tool2Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fixing...
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
                  <Label className="text-sm font-semibold text-green-700">Fixed Text</Label>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool2Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool2Output)}
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 3: Text Summarizer */}
          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-purple-900">Text Summarizer</CardTitle>
              </div>
              <CardDescription className="text-purple-700">
                Create concise summaries & shorten text
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Long Text</Label>
                <Textarea
                  placeholder="Paste long text here to create a summary or shortened version..."
                  className="min-h-[140px] resize-none border-purple-200 focus:border-purple-400 text-sm leading-relaxed"
                  value={tool3Input}
                  onChange={(e) => setTool3Input(e.target.value)}
                />
                {tool3Input.trim() && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tool3Input.trim().split(/\s+/).length} words
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tool3Input.length} characters
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool3Process}
                disabled={!tool3Input.trim() || tool3Loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                size="lg"
              >
                {tool3Loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
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
                  <Label className="text-sm font-semibold text-green-700">Summary</Label>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool3Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool3Output)}
                    className="w-full flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
            <Wand2 className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              All tools powered by AI • Process text instantly • Copy results with one click
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue Writing</h3>
            <p className="text-gray-600 text-sm">AI analyzes your writing style and continues naturally, maintaining your unique voice and tone.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Grammar Fixer</h3>
            <p className="text-gray-600 text-sm">Fix grammar, spelling, punctuation, and improve sentence structure while preserving meaning.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Summarizer</h3>
            <p className="text-gray-600 text-sm">Create concise summaries or shorten text while preserving essential information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}