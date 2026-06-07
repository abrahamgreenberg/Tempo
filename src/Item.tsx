export const Item = ({ id, index }: { id: string; index: number }) => {
  return (
    <div className="rounded-lg border border-border/70 bg-background/95 p-4 shadow">
      <p className="text-sm font-medium">{`Item ${index + 1}`}</p>
      <p className="text-xs text-muted-foreground">{`ID: ${id}`}</p>
    </div>
  )
}

export default Item
