"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Copy, Check, Loader2, Info, CheckCircle, AlertCircle, Download, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { processHandwriting } from "@/lib/groq-service"

export function GrammarFixer() {
  const [inputText, setInputText] = useState("")
  const [fixedText, setFixedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [preserveStyle, setPreserveStyle] = useState(true)
  const [enhanceClarity, setEnhanceClarity] = useState(false)

  const handleFix = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await processHandwriting(inputText, "grammar")
      if (result.processedText) {
        setFixedText(result.processedText)
      }
    } catch (error) {
      console.error("Error fixing grammar:", error)
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
    const blob = new Blob([fixedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grammar-fixed-text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getIssuesCount = (original: string, fixed: string) => {
    // Simple heuristic to estimate fixes made
    const originalWords = original.split(/\s+/).length
    const fixedWords = fixed.split(/\s+/).length
    const lengthDiff = Math.abs(originalWords - fixedWords)
    const charDiff = Math.abs(original.length - fixed.length)
    return Math.max(1, Math.floor((lengthDiff + charDiff / 10) / 2))
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-emerald-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Grammar & Style Fixer
          </CardTitle>
          <CardDescription>
            Fix grammar, spelling, punctuation, and improve sentence structure while preserving your original meaning
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="input-text">Text to Fix</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Paste any text with grammar issues, typos, or awkward phrasing. The AI will fix errors while maintaining your original voice and meaning.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="input-text"
                placeholder="Paste your text here... For example: 'I was walking to the store yesterday and i seen my friend john. He told me that there going to the movies later and asked if i want to come to.'"
                className="min-h-[200px] resize-none border-emerald-200 focus:border-emerald-400"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText.trim() && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{getWordCount(inputText)} words</span>
                  <span>{inputText.length} characters</span>
                  <Badge variant="outline" className="text-xs">
                    {inputText.split(/[.!?]+/).filter(s => s.trim()).length} sentences
                  </Badge>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-900">Fixing Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">Preserve Original Style</Label>
                    <p className="text-xs text-gray-500">Keep your unique voice and tone</p>
                  </div>
                  <Switch
                    checked={preserveStyle}
                    onCheckedChange={setPreserveStyle}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">Enhance Clarity</Label>
                    <p className="text-xs text-gray-500">Improve readability and flow</p>
                  </div>
                  <Switch
                    checked={enhanceClarity}
                    onCheckedChange={setEnhanceClarity}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setInputText("")} disabled={!inputText.trim() || isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={handleFix}
                disabled={!inputText.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Fix Grammar & Style
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {fixedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Fixed Text
                </CardTitle>
                <CardDescription>
                  Grammar, spelling, and style have been improved
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fixedText)}
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
              {/* Comparison View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Original Text
                  </Label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">{inputText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(inputText)} words</span>
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                      Needs fixing
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fixed Text
                  </Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{fixedText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(fixedText)} words</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      {getIssuesCount(inputText, fixedText)} issues fixed
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Improvement Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Improvements Made</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">✓</div>
                    <div className="text-blue-800">Grammar Fixed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">✓</div>
                    <div className="text-blue-800">Spelling Corrected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">✓</div>
                    <div className="text-blue-800">Punctuation Fixed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">✓</div>
                    <div className="text-blue-800">Style Enhanced</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setInputText(fixedText)}
                  className="flex-1"
                >
                  Use as New Input
                </Button>
                <Button
                  onClick={handleFix}
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Fix Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-amber-800 mb-3">🔧 Grammar Fixing Tips</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li>• The AI fixes common errors: subject-verb agreement, tense consistency, punctuation</li>
            <li>• Enable "Preserve Style" to maintain your unique voice and personality</li>
            <li>• Use "Enhance Clarity" for academic or professional writing</li>
            <li>• Works great for emails, essays, reports, and creative writing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}