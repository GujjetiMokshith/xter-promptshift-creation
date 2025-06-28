"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Copy, Check, Loader2, CheckCircle, Download, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Input Card */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-emerald-50 border-b border-emerald-100">
          <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
            <FileText className="h-5 w-5" />
            Grammar
          </CardTitle>
          <CardDescription className="text-emerald-700">
            Only English is supported. Paste or type text to check.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Text Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Only English is supported. Paste or type text to check."
                className="min-h-[200px] resize-none border-emerald-200 focus:border-emerald-400 text-base"
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
                onClick={handleFix}
                disabled={!inputText.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Improve
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {fixedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  Improved Text
                </CardTitle>
                <CardDescription className="text-green-700">
                  Grammar and style have been improved
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fixedText)}
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
              {/* Comparison View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Original Text</Label>
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
                  <Label className="text-sm font-medium text-green-700">Fixed Text</Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{fixedText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(fixedText)} words</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Improved
                    </Badge>
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
    </div>
  )
}