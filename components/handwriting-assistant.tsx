"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, Copy, Check, Loader2, Info, FileText, Scissors, BookOpen, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processHandwriting } from "@/lib/groq-service"

export function HandwritingAssistant() {
  const [inputText, setInputText] = useState("")
  const [processedText, setProcessedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [actionType, setActionType] = useState<"continue" | "grammar" | "shorten" | "summarize">("continue")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("input")

  const handleProcess = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await processHandwriting(inputText, actionType)
      if (result.processedText) {
        setProcessedText(result.processedText)
        setActiveTab("results")
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

  const actionDescriptions = {
    continue: "AI will analyze your writing style and continue the text naturally, maintaining tone and context.",
    grammar: "Fix grammar, spelling, punctuation, and improve sentence structure while preserving meaning.",
    shorten: "Condense the text while keeping all essential information and maintaining clarity.",
    summarize: "Create a concise summary highlighting the main points and key information."
  }

  const actionIcons = {
    continue: <ArrowRight className="h-4 w-4" />,
    grammar: <FileText className="h-4 w-4" />,
    shorten: <Scissors className="h-4 w-4" />,
    summarize: <BookOpen className="h-4 w-4" />
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCharCount = (text: string) => {
    return text.length
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-green-100 shadow-md">
        <CardHeader className="bg-green-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <PenTool className="h-5 w-5 text-green-500" />
            AI Handwriting Assistant
          </CardTitle>
          <CardDescription>Continue writing, fix grammar, shorten text, or create summaries with AI assistance</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="results" disabled={!processedText}>
                Results {processedText && "(Ready)"}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="input" className="m-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="text-input">Your Text</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Paste or type any text you want to improve. Works with drafts, emails, essays, articles, or any written content.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    id="text-input"
                    placeholder="Paste your text here or start writing something you'd like AI to help with..."
                    className="min-h-[200px] resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  {inputText.trim() && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>{getWordCount(inputText)} words</span>
                      <span>{getCharCount(inputText)} characters</span>
                      <Badge variant="outline" className="text-xs">
                        {inputText.length < 50 ? "Short" : inputText.length < 200 ? "Medium" : "Long"} text
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Label>Choose Action</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Select what you want the AI to do with your text. Each action is optimized for different writing needs.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <RadioGroup
                    value={actionType}
                    onValueChange={(value) => setActionType(value as any)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {(["continue", "grammar", "shorten", "summarize"] as const).map((action) => (
                      <div key={action} className="flex flex-col space-y-2 border border-gray-200 rounded-md p-4 hover:border-green-200 hover:bg-green-50/10 transition-all cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={action} id={action} />
                          <div className="flex items-center gap-2">
                            {actionIcons[action]}
                            <Label htmlFor={action} className="font-medium capitalize cursor-pointer">
                              {action === "continue" ? "Continue Writing" : 
                               action === "grammar" ? "Fix Grammar" :
                               action === "shorten" ? "Shorten Text" : "Summarize"}
                            </Label>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 ml-8">{actionDescriptions[action]}</p>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setInputText("")} disabled={!inputText.trim() || isLoading}>
                Clear
              </Button>
              <Button
                onClick={handleProcess}
                disabled={!inputText.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionIcons[actionType]}
                    <span className="ml-2">
                      {actionType === "continue" ? "Continue Writing" : 
                       actionType === "grammar" ? "Fix Grammar" :
                       actionType === "shorten" ? "Shorten Text" : "Summarize"}
                    </span>
                  </>
                )}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <CardContent className="pt-6">
              {processedText && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    {actionIcons[actionType]}
                    <p className="text-sm text-green-700 font-medium">
                      {actionType === "continue" ? "AI has continued your writing" :
                       actionType === "grammar" ? "Grammar and style have been improved" :
                       actionType === "shorten" ? "Text has been condensed" : "Summary has been created"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Original Text</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{inputText}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{getWordCount(inputText)} words</span>
                        <span>{getCharCount(inputText)} characters</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700">
                          {actionType === "continue" ? "Continued Text" :
                           actionType === "grammar" ? "Improved Text" :
                           actionType === "shorten" ? "Shortened Text" : "Summary"}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(processedText)}
                          className="h-8 w-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-green-900 whitespace-pre-wrap">{processedText}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{getWordCount(processedText)} words</span>
                        <span>{getCharCount(processedText)} characters</span>
                        {actionType === "shorten" && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round((1 - getWordCount(processedText) / getWordCount(inputText)) * 100)}% shorter
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("input")}>
                Back to Input
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInputText(processedText)}
                >
                  Use as New Input
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionIcons[actionType]}
                      <span className="ml-2">Process Again</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}