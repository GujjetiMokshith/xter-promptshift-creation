"use client"

import React, { useState } from "react"
import { PenTool, ArrowRight, FileText, BookOpen, Home, Wand2, CheckCircle, Scissors, Copy, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <PenTool className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Writing Tools</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Three-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Tool 1: Continue Writing */}
          <Card className="shadow-sm border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-5 w-5" />
                Continue Writing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Text</Label>
                <Textarea
                  placeholder="Start writing and AI will continue..."
                  className="min-h-[120px] resize-none text-sm"
                  value={tool1Input}
                  onChange={(e) => setTool1Input(e.target.value)}
                />
                {tool1Input.trim() && (
                  <Badge variant="outline" className="text-xs">
                    {getWordCount(tool1Input)} words
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTool1Input("")}
                  disabled={!tool1Input.trim() || tool1Loading}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleTool1Process}
                  disabled={!tool1Input.trim() || tool1Loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {tool1Loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 mr-1" />
                      Continue
                    </>
                  )}
                </Button>
              </div>

              {tool1Output && (
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-sm font-medium text-green-700">Result</Label>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool1Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool1Output)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 2: Grammar Fixer */}
          <Card className="shadow-sm border-emerald-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                Grammar Fixer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text to Fix</Label>
                <Textarea
                  placeholder="Paste text with grammar issues..."
                  className="min-h-[120px] resize-none text-sm"
                  value={tool2Input}
                  onChange={(e) => setTool2Input(e.target.value)}
                />
                {tool2Input.trim() && (
                  <Badge variant="outline" className="text-xs">
                    {getWordCount(tool2Input)} words
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTool2Input("")}
                  disabled={!tool2Input.trim() || tool2Loading}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleTool2Process}
                  disabled={!tool2Input.trim() || tool2Loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  {tool2Loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Fix
                    </>
                  )}
                </Button>
              </div>

              {tool2Output && (
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-sm font-medium text-green-700">Result</Label>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool2Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool2Output)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool 3: Text Summarizer */}
          <Card className="shadow-sm border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                <Scissors className="h-5 w-5" />
                Summarizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Long Text</Label>
                <Textarea
                  placeholder="Paste long text to summarize..."
                  className="min-h-[120px] resize-none text-sm"
                  value={tool3Input}
                  onChange={(e) => setTool3Input(e.target.value)}
                />
                {tool3Input.trim() && (
                  <Badge variant="outline" className="text-xs">
                    {getWordCount(tool3Input)} words
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTool3Input("")}
                  disabled={!tool3Input.trim() || tool3Loading}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleTool3Process}
                  disabled={!tool3Input.trim() || tool3Loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  {tool3Loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <BookOpen className="h-3 w-3 mr-1" />
                      Summarize
                    </>
                  )}
                </Button>
              </div>

              {tool3Output && (
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-sm font-medium text-green-700">Result</Label>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {tool3Output}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tool3Output)}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}