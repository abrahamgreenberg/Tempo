export const Column = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full flex-col gap-4 rounded-lg border border-border/70 bg-background/95 p-4 shadow-lg">
      {children}
    </div>
  )
}

export default Column
