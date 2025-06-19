"use client"

// @ts-nocheck
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ToolsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "enhancer"
  
  useEffect(() => {
    // Redirect to the main chat interface with the selected agent
    router.push(`/?agent=${tab}`)
  }, [router, tab])

  return (
    <div className="container mx-auto py-8 px-4 flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to chat interface...</h2>
        <p>You'll be redirected to use the {tab} tool in the main chat interface.</p>
      </div>
    </div>
  )
}
