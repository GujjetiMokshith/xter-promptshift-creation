"use client"

import React, { useState } from "react"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
}

export function Tooltip({ children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TooltipTrigger) {
          return child;
        }
        if (React.isValidElement(child) && child.type === TooltipContent) {
          return isVisible ? child : null;
        }
        return child;
      })}
    </div>
  );
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  return <>{children}</>
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function TooltipContent({ children, side = "top", className = "" }: TooltipContentProps) {
  return (
    <div
      className={`sidebar-tooltip overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
      data-side={side}
    >
      {children}
    </div>
  )
}