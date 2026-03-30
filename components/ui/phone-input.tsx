"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, onValueChange, ...props }, ref) => {
    const formatTurkishPhoneNumber = (input: string) => {
      // Get numbers
      let numbers = input.replace(/\D/g, "")
      
      // If starts with 90, strip it to avoid duplication during typing
      if (numbers.startsWith("90") && numbers.length > 2) {
        numbers = numbers.substring(2)
      } else if (numbers.startsWith("0")) {
        numbers = numbers.substring(1)
      }
      
      // Limit to 10 digits
      numbers = numbers.substring(0, 10)
      
      if (numbers.length === 0) return { formatted: "", cleaned: "" }

      let formatted = "+90 "
      if (numbers.length > 0) {
        formatted += numbers.substring(0, 3)
      }
      if (numbers.length > 3) {
        formatted += " " + numbers.substring(3, 6)
      }
      if (numbers.length > 6) {
        formatted += " " + numbers.substring(6, 8)
      }
      if (numbers.length > 8) {
        formatted += " " + numbers.substring(8, 10)
      }
      
      return { formatted, cleaned: "90" + numbers }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { formatted, cleaned } = formatTurkishPhoneNumber(e.target.value)
      
      e.target.value = formatted
      if (onChange) onChange(e)
      if (onValueChange) onValueChange(cleaned)
    }

    return (
      <Input
        type="tel"
        className={cn(className)}
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="+90 5XX XXX XX XX"
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
