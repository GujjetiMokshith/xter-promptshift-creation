"use client"

import React, { useState } from "react"
import { PenTool, ArrowRight, FileText, BookOpen, Home, Wand2, CheckCircle, Scissors } from "lucide-react"
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
    } finally {
      setTool3Loading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PenTool className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Handwriting Assistant</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tool 1: Continue Writing */}
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-900">Continue Writing</CardTitle>
              </div>
              <CardDescription className="text-blue-700 text-sm">
                AI continues your text naturally
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Your Text</Label>
                <Textarea
                  placeholder="Start writing something and AI will continue it..."
                  className="min-h-[120px] resize-none border-blue-200 focus:border-blue-400 text-sm"
                  value={tool1Input}
                  onChange={(e) => setTool1Input(e.target.value)}
                />
                {tool1Input.trim() && (
                  <div className="text-xs text-gray-500">
                    {tool1Input.trim().split(/\s+/).length} words
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool1Process}
                disabled={!tool1Input.trim() || tool1Loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                {tool1Loading ? "Continuing..." : "Continue Writing"}
              </Button>

              {tool1Output && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">AI Continuation</Label>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool1Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool1Output)}
                    className="w-full text-xs"
                  >
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 2: Grammar Fixer */}
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg text-emerald-900">Grammar Fixer</CardTitle>
              </div>
              <CardDescription className="text-emerald-700 text-sm">
                Fix grammar, spelling & style
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Text to Fix</Label>
                <Textarea
                  placeholder="Paste text with grammar issues here..."
                  className="min-h-[120px] resize-none border-emerald-200 focus:border-emerald-400 text-sm"
                  value={tool2Input}
                  onChange={(e) => setTool2Input(e.target.value)}
                />
                {tool2Input.trim() && (
                  <div className="text-xs text-gray-500">
                    {tool2Input.trim().split(/\s+/).length} words
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool2Process}
                disabled={!tool2Input.trim() || tool2Loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
                size="sm"
              >
                {tool2Loading ? "Fixing..." : "Fix Grammar"}
              </Button>

              {tool2Output && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">Fixed Text</Label>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool2Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool2Output)}
                    className="w-full text-xs"
                  >
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 3: Text Summarizer */}
          <Card className="border-purple-200 shadow-sm">
            <CardHeader className="bg-purple-50 border-b border-purple-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900">Text Summarizer</CardTitle>
              </div>
              <CardDescription className="text-purple-700 text-sm">
                Create concise summaries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Long Text</Label>
                <Textarea
                  placeholder="Paste long text to summarize..."
                  className="min-h-[120px] resize-none border-purple-200 focus:border-purple-400 text-sm"
                  value={tool3Input}
                  onChange={(e) => setTool3Input(e.target.value)}
                />
                {tool3Input.trim() && (
                  <div className="text-xs text-gray-500">
                    {tool3Input.trim().split(/\s+/).length} words
                  </div>
                )}
              </div>

              <Button
                onClick={handleTool3Process}
                disabled={!tool3Input.trim() || tool3Loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                size="sm"
              >
                {tool3Loading ? "Summarizing..." : "Summarize Text"}
              </Button>

              {tool3Output && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">Summary</Label>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool3Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool3Output)}
                    className="w-full text-xs"
                  >
                    Copy Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Wand2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              All tools powered by AI • Process text instantly • Copy results with one click
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}