"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Copy, Check, Loader2, Wand2, RefreshCw, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processHandwriting } from "@/lib/groq-service"

export function ContinueWriting() {
  const [inputText, setInputText] = useState("")
  const [continuedText, setContinuedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [writingStyle, setWritingStyle] = useState("maintain")
  const [continuationLength, setContinuationLength] = useState("medium")

  const handleContinue = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await processHandwriting(inputText, "continue")
      if (result.processedText) {
        setContinuedText(result.processedText)
      }
    } catch (error) {
      console.error("Error continuing text:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadText = () => {
    const fullText = inputText + "\n\n" + continuedText
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'continued-writing.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const styleOptions = [
    { value: "maintain", label: "Maintain Original Style" },
    { value: "formal", label: "More Formal" },
    { value: "casual", label: "More Casual" },
    { value: "creative", label: "More Creative" },
  ]

  const lengthOptions = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Input Card */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
            <ArrowRight className="h-5 w-5" />
            Continue Writing
          </CardTitle>
          <CardDescription className="text-blue-700">
            Paste your text and let AI continue it naturally
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Text Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Your Text</Label>
              <Textarea
                placeholder="Enter the topic you want to write about..."
                className="min-h-[200px] resize-none border-blue-200 focus:border-blue-400 text-base"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText.trim() && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{getWordCount(inputText)} words</span>
                  <Badge variant="outline" className="text-xs">
                    {inputText.length < 100 ? "Short" : inputText.length < 500 ? "Medium" : "Long"} input
                  </Badge>
                </div>
              )}
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Writing Style</Label>
                <Select value={writingStyle} onValueChange={setWritingStyle}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Length</Label>
                <Select value={continuationLength} onValueChange={setContinuationLength}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setInputText("")} 
                disabled={!inputText.trim() || isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Continue Writing
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {continuedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-green-900">
                  <Check className="h-5 w-5" />
                  Continued Text
                </CardTitle>
                <CardDescription className="text-green-700">
                  AI has continued your writing naturally
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(inputText + "\n\n" + continuedText)}
                  className="flex items-center gap-1"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadText}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Original Text */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Your Original Text</Label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inputText}</p>
                </div>
              </div>

              {/* Continuation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-700">AI Continuation</Label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{continuedText}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{getWordCount(continuedText)} words added</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((getWordCount(continuedText) / getWordCount(inputText)) * 100)}% expansion
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setInputText(inputText + "\n\n" + continuedText)}
                  className="flex-1"
                >
                  Use as New Input
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Continue Further
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}