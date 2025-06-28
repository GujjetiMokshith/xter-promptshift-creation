"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Copy, Check, Loader2, Info, Scissors, BarChart3, Download, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { processHandwriting } from "@/lib/groq-service"

export function TextSummarizer() {
  const [inputText, setInputText] = useState("")
  const [processedText, setProcessedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"summarize" | "shorten">("summarize")
  const [compressionLevel, setCompressionLevel] = useState(50)

  const handleProcess = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await processHandwriting(inputText, mode)
      if (result.processedText) {
        setProcessedText(result.processedText)
      }
    } catch (error) {
      console.error("Error processing text:", error)
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
    const blob = new Blob([processedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mode}-result.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getReadingTime = (text: string) => {
    const words = getWordCount(text)
    return Math.ceil(words / 200) // Average reading speed
  }

  const getCompressionRatio = () => {
    if (!inputText || !processedText) return 0
    const originalWords = getWordCount(inputText)
    const processedWords = getWordCount(processedText)
    return Math.round((1 - processedWords / originalWords) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Text Summarizer & Shortener
          </CardTitle>
          <CardDescription>
            Create concise summaries or shorten text while preserving essential information and key insights
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="input-text">Text to Process</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Paste long articles, reports, emails, or any text you want to summarize or shorten. Works best with content over 100 words.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="input-text"
                placeholder="Paste your long text here... For example: articles, research papers, reports, emails, or any content you want to summarize or shorten while keeping the key information."
                className="min-h-[250px] resize-none border-purple-200 focus:border-purple-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText.trim() && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{getWordCount(inputText)} words</span>
                  <span>~{getReadingTime(inputText)} min read</span>
                  <Badge variant="outline" className="text-xs">
                    {inputText.length < 500 ? "Short" : inputText.length < 2000 ? "Medium" : "Long"} text
                  </Badge>
                </div>
              )}
            </div>

            {/* Processing Mode */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <Label>Processing Mode</Label>
              <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as "summarize" | "shorten")}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-purple-200 hover:bg-purple-50/10 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="summarize" id="summarize" />
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <Label htmlFor="summarize" className="font-medium cursor-pointer">
                        Summarize
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">Extract key points and main ideas into a concise summary</p>
                </div>

                <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-purple-200 hover:bg-purple-50/10 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="shorten" id="shorten" />
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-purple-600" />
                      <Label htmlFor="shorten" className="font-medium cursor-pointer">
                        Shorten
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">Reduce length while keeping all essential information</p>
                </div>
              </RadioGroup>
            </div>

            {/* Compression Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Target Compression</Label>
                <Badge variant="outline" className="text-xs">
                  {compressionLevel}% shorter
                </Badge>
              </div>
              <Slider
                value={[compressionLevel]}
                onValueChange={(value) => setCompressionLevel(value[0])}
                max={80}
                min={20}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Light (20%)</span>
                <span>Moderate (50%)</span>
                <span>Aggressive (80%)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setInputText("")} disabled={!inputText.trim() || isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={handleProcess}
                disabled={!inputText.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "summarize" ? (
                      <BarChart3 className="mr-2 h-4 w-4" />
                    ) : (
                      <Scissors className="mr-2 h-4 w-4" />
                    )}
                    {mode === "summarize" ? "Create Summary" : "Shorten Text"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {processedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  {mode === "summarize" ? "Summary" : "Shortened Text"}
                </CardTitle>
                <CardDescription>
                  {mode === "summarize" 
                    ? "Key points and main ideas extracted" 
                    : "Text condensed while preserving essential information"
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(processedText)}
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
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getCompressionRatio()}%</div>
                  <div className="text-xs text-blue-800">Compression</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getWordCount(processedText)}</div>
                  <div className="text-xs text-blue-800">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getReadingTime(processedText)}</div>
                  <div className="text-xs text-blue-800">Min Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((getWordCount(processedText) / getWordCount(inputText)) * 100)}%
                  </div>
                  <div className="text-xs text-blue-800">Of Original</div>
                </div>
              </div>

              {/* Comparison View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Original Text</Label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inputText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(inputText)} words</span>
                    <span>~{getReadingTime(inputText)} min read</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">
                    {mode === "summarize" ? "Summary" : "Shortened Version"}
                  </Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{processedText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(processedText)} words</span>
                    <span>~{getReadingTime(processedText)} min read</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      {getCompressionRatio()}% shorter
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setInputText(processedText)}
                  className="flex-1"
                >
                  Use as New Input
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Process Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-amber-800 mb-3">📝 Summarizing Tips</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• <strong>Summarize:</strong> Best for extracting key insights from long articles or reports</li>
            <li>• <strong>Shorten:</strong> Ideal for reducing email length or condensing content while keeping details</li>
            <li>• Use higher compression for quick overviews, lower for detailed condensation</li>
            <li>• Works great with academic papers, news articles, business reports, and research</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}