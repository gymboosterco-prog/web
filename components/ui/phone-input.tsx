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
      // Strip all non-numeric characters
      const numbers = input.replace(/\D/g, "")
      
      // Handle the leading 90 or 0 if present
      let cleaned = numbers
      if (cleaned.startsWith("90")) {
        cleaned = cleaned.substring(2)
      } else if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1)
      }
      
      // Limit to 10 digits (after 90)
      cleaned = cleaned.substring(0, 10)
      
      // Format: 5XX XXX XX XX
      let formatted = "+90 "
      if (cleaned.length > 0) {
        formatted += cleaned.substring(0, 3)
      }
      if (cleaned.length > 3) {
        formatted += " " + cleaned.substring(3, 6)
      }
      if (cleaned.length > 6) {
        formatted += " " + cleaned.substring(6, 8)
      }
      if (cleaned.length > 8) {
        formatted += " " + cleaned.substring(8, 10)
      }
      
      return { formatted, cleaned: "90" + cleaned }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      // If user deletes everything, keep +90 or clear
      if (input.length < 4) {
        if (onChange) e.target.value = ""
        if (onValueChange) onValueChange("")
        return
      }
      
      const { formatted, cleaned } = formatTurkishPhoneNumber(input)
      
      // Update the event value for the parent's onChange
      e.target.value = formatted
      if (onChange) {
        onChange(e)
      }
      if (onValueChange) {
        onValueChange(cleaned)
      }
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
