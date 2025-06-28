"use client"

import React from "react"

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function RadioGroup({ value, onValueChange, className = "", children }: RadioGroupProps) {
  return (
    <div className={className} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
}

export interface RadioGroupItemProps {
  value: string
  id?: string
  checked?: boolean
  onChange?: () => void
  className?: string
}

export function RadioGroupItem({ value, id, checked, onChange, className = "" }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 rounded-full border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}