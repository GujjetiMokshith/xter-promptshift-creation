"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Copy, Check, Loader2, Search, BookOpen, Lightbulb, RefreshCw, Download, Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { analyzeDocument } from "@/lib/groq-service"

export function DocumentAnalyzerTool() {
  const [inputText, setInputText] = useState("")
  const [processedText, setProcessedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [analysisType, setAnalysisType] = useState<"summarize" | "extract-keywords" | "q-and-a">("summarize")
  const [question, setQuestion] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await analyzeDocument(inputText, analysisType, question)
      if (result.processedText) {
        setProcessedText(result.processedText)
      }
    } catch (error) {
      console.error("Error analyzing document:", error)
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
    a.download = `document-analysis-${analysisType}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    } else {
      alert('Please select a text file (.txt)')
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getReadingTime = (text: string) => {
    const words = getWordCount(text)
    return Math.ceil(words / 200) // Average reading speed
  }

  const analysisOptions = [
    {
      id: "summarize",
      name: "Summarize Document",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Create a comprehensive summary of the document's main points",
      color: "bg-blue-500"
    },
    {
      id: "extract-keywords",
      name: "Extract Keywords",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Identify and categorize important keywords and concepts",
      color: "bg-amber-500"
    },
    {
      id: "q-and-a",
      name: "Question & Answer",
      icon: <Search className="h-5 w-5" />,
      description: "Ask specific questions about the document content",
      color: "bg-green-500"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Input Card */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-purple-50 border-b border-purple-100">
          <CardTitle className="text-xl flex items-center gap-2 text-purple-900">
            <FileText className="h-5 w-5" />
            AI Document Analyzer
          </CardTitle>
          <CardDescription className="text-purple-700">
            Upload or paste document content for AI-powered analysis and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Document Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Document Content</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload .txt file
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Paste your document content here... This can be articles, research papers, reports, emails, or any text you want to analyze. The AI will provide insights based on your selected analysis type."
                className="min-h-[300px] resize-none border-purple-200 focus:border-purple-400 text-base"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {inputText.trim() && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{getWordCount(inputText)} words</span>
                  <span>~{getReadingTime(inputText)} min read</span>
                  <Badge variant="outline" className="text-xs">
                    {inputText.length < 1000 ? "Short" : inputText.length < 5000 ? "Medium" : "Long"} document
                  </Badge>
                </div>
              )}
            </div>

            {/* Analysis Type Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Analysis Type</Label>
              <RadioGroup
                value={analysisType}
                onValueChange={(value) => setAnalysisType(value as any)}
                className="grid grid-cols-1 gap-4"
              >
                {analysisOptions.map((option) => (
                  <div key={option.id} className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-purple-200 hover:bg-purple-50/10 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${option.color} rounded-md flex items-center justify-center text-white`}>
                          {option.icon}
                        </div>
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 ml-8">{option.description}</p>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Question Input for Q&A */}
            {analysisType === "q-and-a" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Your Question</Label>
                <Input
                  placeholder="What specific question do you want to ask about this document?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => {
                  setInputText("")
                  setProcessedText("")
                  setQuestion("")
                }} 
                disabled={!inputText.trim() || isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isLoading || (analysisType === "q-and-a" && !question.trim())}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {processedText && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-green-900">
                  <Check className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription className="text-green-700">
                  {analysisType === "summarize" && "Document summary generated"}
                  {analysisType === "extract-keywords" && "Keywords and concepts extracted"}
                  {analysisType === "q-and-a" && `Answer to: "${question}"`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(processedText)}
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
              {/* Analysis Type Badge */}
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {analysisOptions.find(opt => opt.id === analysisType)?.name}
                </Badge>
                {analysisType === "q-and-a" && question && (
                  <Badge variant="outline" className="text-xs">
                    Question: {question.length > 50 ? question.substring(0, 50) + "..." : question}
                  </Badge>
                )}
              </div>

              {/* Results Display */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">Analysis Output</Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                    <div className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {processedText}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(processedText)} words</span>
                    <span>~{getReadingTime(processedText)} min read</span>
                    {analysisType === "summarize" && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        {Math.round((getWordCount(processedText) / getWordCount(inputText)) * 100)}% of original
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Original Document Reference */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Original Document</Label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {inputText.length > 500 ? inputText.substring(0, 500) + "..." : inputText}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(inputText)} words total</span>
                    <span>~{getReadingTime(inputText)} min read</span>
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
                  Use Result as New Input
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Analyze Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}