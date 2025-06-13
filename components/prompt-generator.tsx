"use client"

import { useState } from "react"
import { generatePrompts } from "@/lib/grok-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, Copy, Check, Loader2, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function PromptGenerator() {
  const [topic, setTopic] = useState("")
  const [useCase, setUseCase] = useState("general")
  const [maxResults, setMaxResults] = useState(3)
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const useCases = [
    { value: "general", label: "General" },
    { value: "chatgpt", label: "ChatGPT" },
    { value: "midjourney", label: "Midjourney" },
    { value: "claude", label: "Claude" },
    { value: "email", label: "Email Writing" },
    { value: "blog", label: "Blog Post" },
    { value: "youtube", label: "YouTube Script" },
    { value: "tweet", label: "Twitter Thread" },
    { value: "saas", label: "SaaS Ideas" },
  ]

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      const result = await generatePrompts(topic, useCase, maxResults)
      if (result.generatedPrompts) {
        setGeneratedPrompts(result.generatedPrompts)
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-emerald-100 shadow-md">
        <CardHeader className="bg-emerald-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <PenTool className="h-5 w-5 text-emerald-500" />
            Prompt Generator
          </CardTitle>
          <CardDescription>Generate new prompts based on a topic, keyword, or goal</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic-input">Topic or Keyword</Label>
              <Input
                id="topic-input"
                placeholder="Enter a topic (e.g., 'artificial intelligence', 'climate change')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="use-case">Use Case</Label>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger id="use-case">
                    <SelectValue placeholder="Select a use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {useCases.map((useCase) => (
                      <SelectItem key={useCase.value} value={useCase.value}>
                        {useCase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-results">Number of Results: {maxResults}</Label>
                </div>
                <Slider
                  id="max-results"
                  min={1}
                  max={5}
                  step={1}
                  value={[maxResults]}
                  onValueChange={(value) => setMaxResults(value[0])}
                  className="mt-4"
                />
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
      </Card>

      {generatedPrompts.length > 0 && (
        <Card className="border border-emerald-100 shadow-md">
          <CardHeader>
            <CardTitle>Generated Prompts</CardTitle>
            <CardDescription>Use these prompts as starting points for your AI interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-emerald-100 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
