import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
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

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return form
}
