"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Copy, Check, Loader2, Info, Wand2, RefreshCw, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
    { value: "maintain", label: "Maintain Original Style", description: "Keep the same tone and voice" },
    { value: "formal", label: "More Formal", description: "Professional and academic tone" },
    { value: "casual", label: "More Casual", description: "Conversational and friendly" },
    { value: "creative", label: "More Creative", description: "Vivid and imaginative language" },
  ]

  const lengthOptions = [
    { value: "short", label: "Short", description: "1-2 paragraphs" },
    { value: "medium", label: "Medium", description: "3-4 paragraphs" },
    { value: "long", label: "Long", description: "5+ paragraphs" },
  ]

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Continue Your Writing
          </CardTitle>
          <CardDescription>
            Paste your text and let AI continue it naturally, maintaining your unique voice and style
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="input-text">Your Text to Continue</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Paste any text you want to continue - stories, articles, emails, essays, or any written content. The AI will analyze your style and continue naturally.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="input-text"
                placeholder="Paste your text here... For example: 'The morning sun cast long shadows across the empty street as Sarah walked toward the mysterious building she had been dreaming about for weeks...'"
                className="min-h-[200px] resize-none border-blue-200 focus:border-blue-400"
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

            {/* Style and Length Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <Label>Writing Style</Label>
                <Select value={writingStyle} onValueChange={setWritingStyle}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Choose style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Continuation Length</Label>
                <Select value={continuationLength} onValueChange={setContinuationLength}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Choose length" />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setInputText("")} disabled={!inputText.trim() || isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {continuedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Continued Text
                </CardTitle>
                <CardDescription>
                  AI has analyzed your style and continued your writing naturally
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(inputText + "\n\n" + continuedText)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadText}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
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

      {/* Tips Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-amber-800 mb-3">💡 Tips for Better Continuations</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• Provide at least 2-3 sentences for the AI to understand your style</li>
            <li>• Include dialogue, descriptions, or narrative elements for richer continuations</li>
            <li>• Try different style options to explore various writing directions</li>
            <li>• Use the "Continue Further" option to extend your story even more</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}