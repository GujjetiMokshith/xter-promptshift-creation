"use client"

import React from "react"
import { FileText, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DocumentAnalyzerTool } from "@/components/document-analyzer/document-analyzer-tool"

export default function DocumentAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Document Analyzer</h1>
              <p className="text-gray-600 mt-1">
                Extract insights, summaries, and answers from your documents using advanced AI
              </p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Main App
            </Button>
          </Link>
        </div>

        {/* Features Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Summarization</h3>
            <p className="text-gray-600 text-sm">
              Generate comprehensive summaries that capture the essence and key points of your documents.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyword Extraction</h3>
            <p className="text-gray-600 text-sm">
              Automatically identify and categorize important keywords, concepts, and entities from your text.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Q&A Analysis</h3>
            <p className="text-gray-600 text-sm">
              Ask specific questions about your document and get accurate, context-aware answers.
            </p>
          </div>
        </div>

        {/* Main Tool */}
        <DocumentAnalyzerTool />

        {/* Usage Tips */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Best Practices</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload clean, well-formatted text for best results</li>
                <li>• For Q&A, ask specific and clear questions</li>
                <li>• Longer documents provide more comprehensive analysis</li>
                <li>• Use summarization for quick overviews of lengthy content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Supported Content</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Research papers and academic articles</li>
                <li>• Business reports and documentation</li>
                <li>• News articles and blog posts</li>
                <li>• Legal documents and contracts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}