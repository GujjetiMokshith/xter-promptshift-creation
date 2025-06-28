"use client"

// @ts-nocheck
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ToolsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "enhancer"
  
  useEffect(() => {
    // Only redirect for valid tabs (removed generator)
    if (tab === "enhancer" || tab === "analyzer") {
      router.push(`/?agent=${tab}`)
    } else {
      // Default to enhancer if invalid tab
      router.push(`/?agent=enhancer`)
    }
  }, [router, tab])

  return (
    <div className="container mx-auto py-8 px-4 flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to chat interface...</h2>
        <p>You'll be redirected to use the {tab === "analyzer" ? "analyzer" : "enhancer"} tool in the main chat interface.</p>
      </div>
    </div>
  )
}