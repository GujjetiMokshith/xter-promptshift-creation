"use client"

import { useState } from "react"
import { enhancePrompt } from "@/lib/groq-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Copy, Check, Loader2, Info, ArrowRight, Sparkles } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PromptEnhancer() {
  const [inputPrompt, setInputPrompt] = useState("")
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toneStyle, setToneStyle] = useState<"formal" | "casual" | "creative" | "technical">("formal")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("input")

  const handleEnhance = async () => {
    if (!inputPrompt.trim()) return

    setIsLoading(true)
    try {
      const result = await enhancePrompt(inputPrompt, toneStyle)
      if (result.enhancedPrompts) {
        setEnhancedPrompts(result.enhancedPrompts)
        setActiveTab("results")
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  // Function to detect prompt type
  const getPromptType = (prompt: string) => {
    const lowercasePrompt = prompt.toLowerCase();
    if (lowercasePrompt.endsWith('?')) return 'Question';
    if (/how to|how do|how can/i.test(lowercasePrompt)) return 'How-to';
    if (/compare|versus|vs\.|difference/i.test(lowercasePrompt)) return 'Comparison';
    if (/create|generate|make|build/i.test(lowercasePrompt)) return 'Creative';
    if (/explain|describe|elaborate|tell me about/i.test(lowercasePrompt)) return 'Explanatory';
    return 'General';
  }
  
  // Function to get tone badge color
  const getToneBadgeColor = (tone: string) => {
    switch(tone) {
      case "formal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "casual": return "bg-green-100 text-green-800 border-green-200";
      case "creative": return "bg-purple-100 text-purple-800 border-purple-200";
      case "technical": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  const toneDescriptions = {
    formal: "Academic language with citations. Professional and authoritative tone.",
    casual: "Conversational language with everyday examples and simple explanations.",
    creative: "Vivid language with metaphors and storytelling approaches.",
    technical: "Precise technical terminology with relevant code examples or specifications."
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-indigo-100 shadow-md">
        <CardHeader className="bg-indigo-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-indigo-500" />
            AI Prompt Enhancer
          </CardTitle>
          <CardDescription>Transform basic prompts into powerful, context-aware instructions</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="results" disabled={enhancedPrompts.length === 0}>
                Results {enhancedPrompts.length > 0 && `(${enhancedPrompts.length})`}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="input" className="m-0">
        <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="prompt-input">Your Basic Prompt</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Enter any basic prompt. Our AI will enhance it with context, structure, and appropriate details based on the type of prompt and selected tone.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
              <Textarea
                id="prompt-input"
                    placeholder="Enter your prompt here (e.g., 'Explain machine learning', 'How to start investing', 'Compare React and Vue')"
                    className="min-h-[150px] resize-none"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
                  
                  {inputPrompt.trim() && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Detected type: {getPromptType(inputPrompt)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Length: {inputPrompt.length} chars
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Label>Select Tone Style</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>The tone style determines how your enhanced prompt will be phrased, affecting the style of response you'll receive from AI systems.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
            </div>

              <RadioGroup
                defaultValue="formal"
                className="flex flex-wrap gap-4"
                value={toneStyle}
                onValueChange={(value) => setToneStyle(value as any)}
              >
                    {(["formal", "casual", "creative", "technical"] as const).map((tone) => (
                      <div key={tone} className="flex flex-col space-y-1 border border-gray-200 rounded-md p-3 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all cursor-pointer">
                <div className="flex items-center space-x-2">
                          <RadioGroupItem value={tone} id={tone} />
                          <Label htmlFor={tone} className="font-medium capitalize">{tone}</Label>
                </div>
                        <p className="text-xs text-gray-500 ml-6">{toneDescriptions[tone]}</p>
                </div>
                    ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setInputPrompt("")} disabled={!inputPrompt.trim() || isLoading}>
            Clear
          </Button>
          <Button
            onClick={handleEnhance}
            disabled={!inputPrompt.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Enhance Prompt
              </>
            )}
          </Button>
        </CardFooter>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <CardContent className="pt-6">
      {enhancedPrompts.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm text-indigo-700 font-medium">We've enhanced your prompt using contextual analysis and best practices</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-shrink-0 w-[180px] bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-medium mb-1">Original Prompt:</h3>
                      <p className="text-xs text-gray-600">{inputPrompt}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium">Enhanced Results:</h3>
                        <Badge className={getToneBadgeColor(toneStyle)}>
                          {toneStyle.charAt(0).toUpperCase() + toneStyle.slice(1)} Tone
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Select the version that best fits your needs</p>
                    </div>
                  </div>
                  
            <div className="space-y-4">
              {enhancedPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-indigo-100 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">Version {index + 1}</Badge>
                              {index === 0 && <Badge className="bg-indigo-100 text-indigo-800">Structure Focus</Badge>}
                              {index === 1 && <Badge className="bg-green-100 text-green-800">Audience Focus</Badge>}
                              {index === 2 && <Badge className="bg-amber-100 text-amber-800">Completeness Focus</Badge>}
                            </div>
                      <p className="whitespace-pre-wrap text-sm">{prompt}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(prompt, index)}
                      className="ml-2 flex-shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
                </div>
              )}
          </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("input")}>
                Back to Input
              </Button>
              <Button
                onClick={handleEnhance}
                disabled={!inputPrompt.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Enhance Again
                  </>
                )}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
        </Card>
    </div>
  )
}