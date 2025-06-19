"use client"

import React from "react"

export interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "destructive":
        return "bg-red-600 text-white hover:bg-red-700"
      case "outline":
        return "border border-gray-300 bg-white hover:bg-gray-100"
      case "secondary":
        return "bg-gray-200 text-gray-800 hover:bg-gray-300"
      case "ghost":
        return "hover:bg-gray-100"
      case "link":
        return "text-blue-600 underline hover:text-blue-800"
      default:
        return "bg-blue-600 text-white hover:bg-blue-700"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "default":
        return "h-10 px-4 py-2"
      case "sm":
        return "h-9 px-3 py-1 text-sm"
      case "lg":
        return "h-11 px-8 py-3"
      case "icon":
        return "h-10 w-10 p-0"
      default:
        return "h-10 px-4 py-2"
    }
  }

  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none"

  return (
    <button
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 