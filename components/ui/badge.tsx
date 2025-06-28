"use client"

import React from "react"

export interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-blue-600 text-white"
      case "secondary":
        return "bg-gray-200 text-gray-800"
      case "destructive":
        return "bg-red-600 text-white"
      case "outline":
        return "border border-gray-300 bg-white text-gray-800"
      default:
        return "bg-blue-600 text-white"
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getVariantClasses()} ${className}`}>
      {children}
    </span>
  )
}