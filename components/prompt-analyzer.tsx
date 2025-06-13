"use client"

import { useState } from "react"
import { analyzePrompt, type GrokResponse } from "@/lib/grok-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Loader2, AlertCircle, CheckCircle, Copy, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export function PromptAnalyzer() {
  const [inputPrompt, setInputPrompt] = useState("")
  const [analysis, setAnalysis] = useState<GrokResponse["analysis"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null)

  const handleAnalyze = async () => {
    if (!inputPrompt.trim()) return

    setIsLoading(true)
    try {
      const result = await analyzePrompt(inputPrompt)
      if (result.analysis) {
        setAnalysis(result.analysis)
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedSuggestion(index)
    setTimeout(() => setCopiedSuggestion(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-amber-100 shadow-md">
        <CardHeader className="bg-amber-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <LineChart className="h-5 w-5 text-amber-500" />
            Prompt Analyzer
          </CardTitle>
          <CardDescription>Rate your prompt quality based on clarity, specificity, and effectiveness</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div>
            <Label htmlFor="prompt-input">Your Prompt</Label>
            <Textarea
              id="prompt-input"
              placeholder="Enter your prompt here to analyze its effectiveness..."
              className="min-h-[120px] mt-2"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setInputPrompt("")} disabled={!inputPrompt.trim() || isLoading}>
            Clear
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!inputPrompt.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <LineChart className="mr-2 h-4 w-4" />
                Analyze Prompt
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {analysis && (
        <Card className="border border-amber-100 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Prompt Analysis</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}/100</span>
              </div>
            </div>
            <Progress value={analysis.score} className={`h-2 ${getProgressColor(analysis.score)}`} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.map((strength, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Areas for Improvement
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Suggestions</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-start p-2 bg-amber-50/50 rounded-md">
                    <p className="text-sm">{suggestion}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(suggestion, index)}
                      className="ml-2 flex-shrink-0"
                    >
                      {copiedSuggestion === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
