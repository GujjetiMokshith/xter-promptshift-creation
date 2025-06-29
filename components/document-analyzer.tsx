"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Copy, Check, Loader2, Search, BookOpen, Hash, Download, RefreshCw, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeDocument } from "@/lib/groq-service"

interface DocumentAnalysis {
  type: "summarize" | "extract-keywords" | "q-and-a"
  result: string
  question?: string
}

export function DocumentAnalyzer() {
  const [documentText, setDocumentText] = useState("")
  const [analysisType, setAnalysisType] = useState<"summarize" | "extract-keywords" | "q-and-a">("summarize")
  const [question, setQuestion] = useState("")
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploadedFile(file)
    setIsLoading(true)

    try {
      const text = await extractTextFromFile(file)
      setDocumentText(text)
      setActiveTab("analyze")
    } catch (error) {
      console.error("Error reading file:", error)
      alert("Error reading file. Please try again or paste text manually.")
    } finally {
      setIsLoading(false)
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result
          if (typeof result === 'string') {
            resolve(result)
          } else if (result instanceof ArrayBuffer) {
            // For PDF files, we'll need to handle them differently
            // For now, we'll convert to text (this is a simplified approach)
            const text = new TextDecoder().decode(result)
            resolve(text)
          } else {
            reject(new Error("Unable to read file"))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error("File reading failed"))
      
      if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const handleAnalyze = async () => {
    if (!documentText.trim()) return

    setIsLoading(true)
    try {
      const result = await analyzeDocument(documentText, analysisType, question)
      if (result.processedText) {
        setAnalysis({
          type: analysisType,
          result: result.processedText,
          question: analysisType === "q-and-a" ? question : undefined
        })
        setActiveTab("results")
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

  const downloadAnalysis = () => {
    if (!analysis) return
    
    const content = `Document Analysis - ${analysis.type.toUpperCase()}\n\n${analysis.result}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-analysis-${analysis.type}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearDocument = () => {
    setDocumentText("")
    setUploadedFile(null)
    setAnalysis(null)
    setQuestion("")
    setActiveTab("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "summarize": return <BookOpen className="h-4 w-4" />
      case "extract-keywords": return <Hash className="h-4 w-4" />
      case "q-and-a": return <Search className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getAnalysisColor = (type: string) => {
    switch (type) {
      case "summarize": return "bg-blue-500"
      case "extract-keywords": return "bg-green-500"
      case "q-and-a": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-orange-100 shadow-md">
        <CardHeader className="bg-orange-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            AI Document Analyzer
          </CardTitle>
          <CardDescription>Upload documents or paste text to get AI-powered analysis, summaries, and insights</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analyze" disabled={!documentText.trim()}>
                Analyze {documentText.trim() && "(Ready)"}
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!analysis}>
                Results {analysis && "(Ready)"}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="upload" className="m-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Upload Document</Label>
                  <div 
                    className="border-2 border-dashed border-orange-200 rounded-lg p-8 text-center hover:border-orange-300 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const files = Array.from(e.dataTransfer.files)
                      if (files[0]) handleFileUpload(files[0])
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your document here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF, TXT, DOC, DOCX files up to 10MB
                    </p>
                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="hidden"
                  />
                  
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">{uploadedFile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDocument}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Manual Text Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">Or Paste Text Directly</Label>
                  </div>
                  <Textarea
                    placeholder="Paste your document text here for analysis..."
                    className="min-h-[200px] resize-none border-orange-200 focus:border-orange-400 text-base"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                  />
                  {documentText.trim() && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{getWordCount(documentText)} words</span>
                      <span>{documentText.length} characters</span>
                      <Badge variant="outline" className="text-xs">
                        {documentText.length < 1000 ? "Short" : documentText.length < 5000 ? "Medium" : "Long"} document
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    onClick={clearDocument} 
                    disabled={!documentText.trim() && !uploadedFile}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    onClick={() => setActiveTab("analyze")}
                    disabled={!documentText.trim()}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Proceed to Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="analyze" className="m-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Document Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Document Preview</Label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {documentText.substring(0, 500)}
                      {documentText.length > 500 && "..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(documentText)} words</span>
                    <span>{documentText.length} characters</span>
                  </div>
                </div>

                {/* Analysis Type Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Choose Analysis Type</Label>
                  <RadioGroup
                    value={analysisType}
                    onValueChange={(value) => setAnalysisType(value as any)}
                    className="grid grid-cols-1 gap-4"
                  >
                    <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-orange-200 hover:bg-orange-50/10 transition-all cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="summarize" id="summarize" />
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <Label htmlFor="summarize" className="font-medium cursor-pointer">
                            Document Summary
                          </Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">Create a comprehensive summary highlighting main points and key insights</p>
                    </div>

                    <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-orange-200 hover:bg-orange-50/10 transition-all cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="extract-keywords" id="extract-keywords" />
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-green-600" />
                          <Label htmlFor="extract-keywords" className="font-medium cursor-pointer">
                            Extract Keywords
                          </Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">Identify and categorize important terms, concepts, and entities</p>
                    </div>

                    <div className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-orange-200 hover:bg-orange-50/10 transition-all cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="q-and-a" id="q-and-a" />
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-purple-600" />
                          <Label htmlFor="q-and-a" className="font-medium cursor-pointer">
                            Question & Answer
                          </Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">Ask specific questions about the document content</p>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question Input for Q&A */}
                {analysisType === "q-and-a" && (
                  <div className="space-y-2">
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
                    onClick={() => setActiveTab("upload")}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Back to Upload
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!documentText.trim() || isLoading || (analysisType === "q-and-a" && !question.trim())}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        {getAnalysisIcon(analysisType)}
                        Analyze Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <CardContent className="pt-6">
              {analysis && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className={`w-6 h-6 ${getAnalysisColor(analysis.type)} rounded-md flex items-center justify-center text-white`}>
                      {getAnalysisIcon(analysis.type)}
                    </div>
                    <p className="text-sm text-orange-700 font-medium">
                      Analysis complete: {analysis.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      {analysis.question && ` - "${analysis.question}"`}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-700">Analysis Results</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(analysis.result)}
                          className="flex items-center gap-1"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAnalysis}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm text-orange-900 whitespace-pre-wrap leading-relaxed">
                          {analysis.result}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("analyze")}
                      className="flex-1"
                    >
                      Analyze Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearDocument}
                      className="flex-1"
                    >
                      New Document
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}