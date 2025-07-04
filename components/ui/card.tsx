"use client"

import React from "react"

export interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export function CardHeader({ className = "", children }: CardHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  )
}

export interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export function CardTitle({ className = "", children }: CardTitleProps) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h3>
  )
}

export interface CardDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function CardDescription({ className = "", children }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

export interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export function CardContent({ className = "", children }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  )
}

export interface CardFooterProps {
  className?: string
  children: React.ReactNode
}

export function CardFooter({ className = "", children }: CardFooterProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`}>
      {children}
    </div>
  )
}