"use client"

import { useState } from "react"
import { generatePrompts } from "@/lib/grok-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, Copy, Check, Loader2, Plus, Info, Target, Tag, Sparkles, Book, FileText, BarChart3, Tool, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PromptGenerator() {
  const [topic, setTopic] = useState("")
  const [useCase, setUseCase] = useState("general")
  const [maxResults, setMaxResults] = useState(3)
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("input")

  const useCases = [
    { value: "general", label: "General", icon: <Globe className="h-4 w-4" />, description: "Balanced mix of different prompt types" },
    { value: "educational", label: "Educational", icon: <Book className="h-4 w-4" />, description: "Focused on teaching and explaining concepts" },
    { value: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" />, description: "Designed for creative and innovative outputs" },
    { value: "analytical", label: "Analytical", icon: <BarChart3 className="h-4 w-4" />, description: "For analysis, comparison, and evaluation" },
    { value: "practical", label: "Practical", icon: <Tool className="h-4 w-4" />, description: "Step-by-step guides and implementation" },
    { value: "interdisciplinary", label: "Interdisciplinary", icon: <FileText className="h-4 w-4" />, description: "Connecting topics across domains" },
  ]

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      const result = await generatePrompts(topic, useCase, maxResults)
      if (result.generatedPrompts) {
        setGeneratedPrompts(result.generatedPrompts)
        setActiveTab("results")
      }
    } catch (error) {
      console.error("Error generating prompts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }
  
  // Helper function to get prompt category icon
  const getUseCaseIcon = (useCaseValue: string) => {
    const useCase = useCases.find(uc => uc.value === useCaseValue);
    return useCase?.icon || <Globe className="h-4 w-4" />;
  }
  
  // Helper function to get a unique tag for each prompt based on content
  const getPromptTag = (prompt: string, index: number) => {
    if (prompt.includes("step-by-step") || prompt.includes("instructions")) {
      return { text: "Tutorial", color: "bg-blue-100 text-blue-800" };
    } else if (prompt.includes("analysis") || prompt.includes("comparative")) {
      return { text: "Analysis", color: "bg-purple-100 text-purple-800" };
    } else if (prompt.includes("guide") || prompt.includes("comprehensive")) {
      return { text: "Complete Guide", color: "bg-emerald-100 text-emerald-800" };
    } else if (prompt.includes("creative") || prompt.includes("unique")) {
      return { text: "Creative", color: "bg-pink-100 text-pink-800" };
    } else if (prompt.includes("system") || prompt.includes("framework")) {
      return { text: "Framework", color: "bg-amber-100 text-amber-800" };
    } else {
      return { text: `Prompt ${index + 1}`, color: "bg-gray-100 text-gray-800" };
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-emerald-100 shadow-md">
        <CardHeader className="bg-emerald-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <PenTool className="h-5 w-5 text-emerald-500" />
            Advanced Prompt Generator
          </CardTitle>
          <CardDescription>Create tailored, high-quality prompts optimized for different use cases</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="results" disabled={generatedPrompts.length === 0}>
                Results {generatedPrompts.length > 0 && `(${generatedPrompts.length})`}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="input" className="m-0">
        <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="topic-input">Topic or Subject</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Enter any topic, concept, technology, or idea you want to generate prompts about. Be specific for better results.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
              <Input
                id="topic-input"
                    placeholder="Enter a topic (e.g., 'artificial intelligence', 'climate change', 'React hooks')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                    className="transition-all duration-200 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300"
                  />
                  {topic && topic.length < 5 && (
                    <p className="text-xs text-amber-600 mt-1">Tip: Using more specific terms will generate better prompts</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Label>Prompt Type & Settings</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>Choose a category that matches your goal. Each category optimizes prompts for different purposes.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
            </div>

                  <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                      <Label htmlFor="use-case" className="text-sm">Prompt Category</Label>
                <Select value={useCase} onValueChange={setUseCase}>
                        <SelectTrigger id="use-case" className="transition-all">
                    <SelectValue placeholder="Select a use case" />
                  </SelectTrigger>
                  <SelectContent>
                          {useCases.map((uc) => (
                            <SelectItem key={uc.value} value={uc.value}>
                              <div className="flex items-center gap-2">
                                {uc.icon}
                                <span>{uc.label}</span>
                              </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {useCases.find(uc => uc.value === useCase)?.description}
                      </p>
              </div>

              <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="max-results" className="text-sm">Number of Results</Label>
                        <Badge variant="outline" className="text-xs font-normal">
                          {maxResults} prompt{maxResults !== 1 ? 's' : ''}
                        </Badge>
                </div>
                <Slider
                  id="max-results"
                  min={1}
                  max={5}
                  step={1}
                  value={[maxResults]}
                  onValueChange={(value) => setMaxResults(value[0])}
                        className="mt-2"
                />
                      <p className="text-xs text-gray-500 mt-1">
                        {maxResults === 1 ? "Generate a single focused prompt" : 
                         maxResults <= 3 ? "Balanced number of results" : 
                         "More variety, but may include less relevant prompts"}
                      </p>
                    </div>
              </div>
            </div>
          </div>
        </CardContent>
            
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setTopic("")} disabled={!topic.trim() || isLoading}>
            Clear
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Prompts
              </>
            )}
          </Button>
        </CardFooter>
          </TabsContent>

          <TabsContent value="results" className="m-0">
            <CardContent className="pt-6">
      {generatedPrompts.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Generated {generatedPrompts.length} specialized prompts about "{topic}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center">
                      {getUseCaseIcon(useCase)}
                      <span className="text-sm ml-2 font-medium capitalize">{useCase} prompts</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm ml-2">{topic}</span>
                    </div>
                  </div>
                  
            <div className="space-y-4">
                    {generatedPrompts.map((prompt, index) => {
                      const tag = getPromptTag(prompt, index);
                      return (
                <div
                  key={index}
                  className="p-4 bg-white border border-emerald-100 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">Prompt {index + 1}</Badge>
                                <Badge className={tag.color}>{tag.text}</Badge>
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  ~{Math.round(prompt.length / 10) * 10} chars
                                </Badge>
                              </div>
                      <p className="whitespace-pre-wrap text-sm">{prompt}</p>
                    </div>
                            <div className="ml-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(prompt, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                        </div>
                      );
                    })}
                  </div>
            </div>
              )}
          </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("input")}>
                Back to Input
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Again
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
