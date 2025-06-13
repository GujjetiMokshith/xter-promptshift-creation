"use client"

import { useState } from "react"
import { enhancePrompt } from "@/lib/grok-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Copy, Check, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function PromptEnhancer() {
  const [inputPrompt, setInputPrompt] = useState("")
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toneStyle, setToneStyle] = useState<"formal" | "casual" | "creative" | "technical">("formal")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleEnhance = async () => {
    if (!inputPrompt.trim()) return

    setIsLoading(true)
    try {
      const result = await enhancePrompt(inputPrompt, toneStyle)
      if (result.enhancedPrompts) {
        setEnhancedPrompts(result.enhancedPrompts)
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="border border-indigo-100 shadow-md">
        <CardHeader className="bg-indigo-50/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-indigo-500" />
            Prompt Enhancer
          </CardTitle>
          <CardDescription>Automatically rewrite your prompts to be more detailed, creative, or direct</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-input">Your Prompt</Label>
              <Textarea
                id="prompt-input"
                placeholder="Enter your prompt here..."
                className="min-h-[120px] mt-2"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tone Style</Label>
              <RadioGroup
                defaultValue="formal"
                className="flex flex-wrap gap-4"
                value={toneStyle}
                onValueChange={(value) => setToneStyle(value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="formal" id="formal" />
                  <Label htmlFor="formal">Formal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual">Casual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creative" id="creative" />
                  <Label htmlFor="creative">Creative</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical">Technical</Label>
                </div>
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
      </Card>

      {enhancedPrompts.length > 0 && (
        <Card className="border border-indigo-100 shadow-md">
          <CardHeader>
            <CardTitle>Enhanced Prompts</CardTitle>
            <CardDescription>Choose the version that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-indigo-100 rounded-lg hover:shadow-md transition-all"
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
