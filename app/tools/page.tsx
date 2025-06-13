"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptEnhancer } from "@/components/prompt-enhancer"
import { PromptGenerator } from "@/components/prompt-generator"
import { PromptAnalyzer } from "@/components/prompt-analyzer"
import { Wand2, PenTool, LineChart } from "lucide-react"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("enhancer")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Prompt Engineering Tools</h1>

      <Tabs defaultValue="enhancer" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="enhancer" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Enhancer</span>
            <span className="sm:hidden">Enhancer</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Generator</span>
            <span className="sm:hidden">Generator</span>
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Analyzer</span>
            <span className="sm:hidden">Analyzer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhancer">
          <PromptEnhancer />
        </TabsContent>

        <TabsContent value="generator">
          <PromptGenerator />
        </TabsContent>

        <TabsContent value="analyzer">
          <PromptAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
