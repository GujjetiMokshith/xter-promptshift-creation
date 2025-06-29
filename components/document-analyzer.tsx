"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Copy, Check, Loader2, Search, BookOpen, Hash, Download, RefreshCw, X, AlertCircle, Home, ArrowLeft, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { analyzeDocument } from "@/lib/groq-service"

interface DocumentAnalysis {
  type: "summarize" | "extract-keywords" | "q-and-a"
  result: string
  question?: string
}

interface DocumentAnalyzerProps {
  onBackToMain?: () => void
}

export function DocumentAnalyzer({ onBackToMain }: DocumentAnalyzerProps) {
  const [documentText, setDocumentText] = useState("")
  const [analysisType, setAnalysisType] = useState<"summarize" | "extract-keywords" | "q-and-a">("summarize")
  const [question, setQuestion] = useState("")
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Enhanced file validation
  const validateFile = (file: File): string | null => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return "File size exceeds 10MB limit. Please use a smaller file."
    }

    // Check if file is empty
    if (file.size === 0) {
      return "File appears to be empty. Please select a file with content."
    }

    // Enhanced file type validation
    const fileName = file.name.toLowerCase()
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return `Unsupported file format. Please use one of: ${allowedExtensions.join(', ')}`
    }

    return null
  }

  // Enhanced text extraction with better encoding support
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase()
      
      // Handle different file types
      if (fileName.endsWith('.txt')) {
        // Enhanced .txt file handling with multiple encoding attempts
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer
            if (!arrayBuffer) {
              reject(new Error("Failed to read file content"))
              return
            }

            // Try multiple encodings in order of preference
            const encodings = ['utf-8', 'utf-16', 'iso-8859-1', 'windows-1252']
            let extractedText = ''
            
            for (const encoding of encodings) {
              try {
                const decoder = new TextDecoder(encoding, { fatal: true })
                extractedText = decoder.decode(arrayBuffer)
                
                // Check if the decoded text contains readable content
                if (extractedText && extractedText.trim().length > 0) {
                  // Remove null characters and other control characters
                  extractedText = extractedText.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                  
                  if (extractedText.trim().length > 0) {
                    resolve(extractedText)
                    return
                  }
                }
              } catch (encodingError) {
                // Continue to next encoding
                continue
              }
            }
            
            // If all encodings failed, try as binary and convert
            try {
              const uint8Array = new Uint8Array(arrayBuffer)
              extractedText = Array.from(uint8Array)
                .map(byte => String.fromCharCode(byte))
                .join('')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
              
              if (extractedText.trim().length > 0) {
                resolve(extractedText)
                return
              }
            } catch (binaryError) {
              // Final fallback failed
            }
            
            reject(new Error("Unable to extract readable text from this file. The file may be corrupted, empty, or in an unsupported encoding."))
            
          } catch (error) {
            reject(new Error("Failed to process file. The file may be corrupted or in an unsupported format."))
          }
        }
        
        reader.onerror = () => reject(new Error("File reading failed. Please try again or use a different file."))
        reader.readAsArrayBuffer(file)
        
      } else if (fileName.endsWith('.pdf')) {
        reject(new Error("PDF files require special processing. Please copy the text content from your PDF and paste it in the text area below for best results."))
        
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        reject(new Error("Word documents require special processing. Please copy the text content from your document and paste it in the text area below for best results."))
        
      } else {
        reject(new Error("Unsupported file format. Please use .txt files or copy and paste your content directly."))
      }
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setError(null)
    setIsLoading(true)

    try {
      // Validate file first
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      setUploadedFile(file)
      const text = await extractTextFromFile(file)
      
      if (!text || text.trim().length === 0) {
        throw new Error("No readable text content found in the file. Please check if the file contains text or try copying and pasting the content directly.")
      }

      // Additional text validation
      if (text.trim().length < 10) {
        throw new Error("The extracted text is too short. Please ensure your file contains substantial text content.")
      }

      setDocumentText(text)
      setActiveTab("analyze")
      
    } catch (error) {
      console.error("Error reading file:", error)
      setError(error instanceof Error ? error.message : "Error reading file. Please try again.")
      setUploadedFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!documentText.trim()) return

    setError(null)
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
      } else {
        throw new Error("No analysis result received from the AI service")
      }
    } catch (error) {
      console.error("Error analyzing document:", error)
      setError("Failed to analyze document. Please check your internet connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        setError("Failed to copy to clipboard. Please select and copy the text manually.")
      }
      
      document.body.removeChild(textArea)
    }
  }

  const downloadAnalysis = () => {
    if (!analysis) return
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const content = `Document Analysis Report
Generated: ${new Date().toLocaleString()}
Analysis Type: ${analysis.type.replace('-', ' ').toUpperCase()}
${analysis.question ? `Question: ${analysis.question}` : ''}

${'='.repeat(50)}

${analysis.result}

${'='.repeat(50)}

Original Document Length: ${getWordCount(documentText)} words
Analysis Generated by: TypingMind Document Analyzer`

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-analysis-${analysis.type}-${timestamp}.txt`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError("Failed to download analysis. Please try copying the text instead.")
    }
  }

  const clearDocument = () => {
    setDocumentText("")
    setUploadedFile(null)
    setAnalysis(null)
    setQuestion("")
    setError(null)
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
    <TooltipProvider>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Enhanced Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToMain && (
              <Button
                variant="outline"
                onClick={onBackToMain}
                className="flex items-center gap-2 hover:bg-orange-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main
              </Button>
            )}
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Document Analyzer</h1>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {documentText.trim() && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Document Ready
              </Badge>
            )}
            {analysis && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Analysis Complete
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-2 text-xs text-red-600">
                <strong>Troubleshooting tips:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>For .txt files: Ensure the file contains readable text and is not corrupted</li>
                  <li>For PDF/Word files: Copy and paste the text content directly for best results</li>
                  <li>Check that your file is under 10MB and contains substantial text content</li>
                </ul>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Card className="border border-orange-100 shadow-md">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              AI Document Analyzer
            </CardTitle>
            <CardDescription>
              Upload documents or paste text to get AI-powered analysis, summaries, and insights. 
              <strong> .txt files work best</strong> - for PDF/Word files, copy and paste the content directly.
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="analyze" disabled={!documentText.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze {documentText.trim() && "(Ready)"}
                </TabsTrigger>
                <TabsTrigger value="results" disabled={!analysis}>
                  <FileText className="h-4 w-4 mr-2" />
                  Results {analysis && "(Ready)"}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upload" className="m-0">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Enhanced File Upload Area */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Upload Document</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Supports .txt files with automatic encoding detection. For PDF and Word files, copy and paste the content for best results.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                        dragActive 
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-orange-500' : 'text-orange-400'}`} />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {dragActive ? 'Drop your file here' : 'Drop your document here or click to browse'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        <strong>Best support:</strong> .txt files up to 10MB<br />
                        <span className="text-xs">PDF/Word files: copy and paste content for optimal results</span>
                      </p>
                      <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
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

                  {/* Enhanced Manual Text Input */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Or Paste Text Directly</Label>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Recommended for best results
                      </Badge>
                    </div>
                    <Textarea
                      placeholder="Paste your document text here for analysis... This method provides the most reliable results and supports all text formats."
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
                        {getWordCount(documentText) < 50 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            Consider adding more content for better analysis
                          </Badge>
                        )}
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
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setActiveTab("analyze")}
                      disabled={!documentText.trim() || isLoading}
                      className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Proceed to Analysis
                        </>
                      )}
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
                      <Badge variant="outline" className="text-xs">
                        Estimated reading time: {Math.ceil(getWordCount(documentText) / 200)} min
                      </Badge>
                    </div>
                  </div>

                  {/* Enhanced Analysis Type Selection */}
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
                        <p className="text-xs text-gray-500 ml-8">Create a comprehensive summary highlighting main points, key insights, and conclusions</p>
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
                        <p className="text-xs text-gray-500 ml-8">Identify and categorize important terms, concepts, entities, and technical vocabulary</p>
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
                        <p className="text-xs text-gray-500 ml-8">Ask specific questions about the document content and get detailed answers</p>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Enhanced Question Input for Q&A */}
                  {analysisType === "q-and-a" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Your Question</Label>
                      <Input
                        placeholder="What specific question do you want to ask about this document?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="border-purple-200 focus:border-purple-400"
                      />
                      <p className="text-xs text-gray-500">
                        Example questions: "What are the main conclusions?", "Who are the key people mentioned?", "What recommendations are made?"
                      </p>
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
                      
                      {/* Analysis Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{getWordCount(analysis.result)}</div>
                          <div className="text-xs text-blue-800">Analysis Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{getWordCount(documentText)}</div>
                          <div className="text-xs text-blue-800">Original Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {Math.round((getWordCount(analysis.result) / getWordCount(documentText)) * 100)}%
                          </div>
                          <div className="text-xs text-blue-800">Compression</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {Math.ceil(getWordCount(analysis.result) / 200)}
                          </div>
                          <div className="text-xs text-blue-800">Min Read</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
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
                      {onBackToMain && (
                        <Button
                          variant="outline"
                          onClick={onBackToMain}
                          className="flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          Main Menu
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </TooltipProvider>
  )
}