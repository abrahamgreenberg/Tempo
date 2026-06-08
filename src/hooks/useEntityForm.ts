import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef } from "react"
import { z } from "zod"

interface UseEntityFormProps<T extends z.ZodType<any, any>> {
  schema: T
  initialData?: Partial<z.infer<T>>
  defaultValues: z.infer<T>
}

export function useEntityForm<T extends z.ZodType<any, any>>({
  schema,
  initialData,
  defaultValues: defaultValuesProp,
}: UseEntityFormProps<T>) {
  const defaultValues = useMemo(
    () => ({ ...defaultValuesProp, ...initialData }),
    [initialData, defaultValuesProp]
  )

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  })

  // Track the initial data ID to only reset when switching items
  const initialDataIdRef = useRef<string | undefined>(
    initialData && "id" in initialData ? (initialData.id as string) : undefined
  )

  useEffect(() => {
    const currentId =
      initialData && "id" in initialData
        ? (initialData.id as string)
        : undefined

    // Only reset if we're switching to a different item or opening a new form
    if (currentId !== initialDataIdRef.current) {
      initialDataIdRef.current = currentId
      form.reset(defaultValues)
    }
  }, [initialData, defaultValues, form])

  return form
}
