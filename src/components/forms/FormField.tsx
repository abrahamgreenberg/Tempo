import type { ReactNode } from "react"

interface FormFieldProps {
  htmlFor: string
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ htmlFor, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}
