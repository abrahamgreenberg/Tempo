import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function PreviewPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">PDF Preview</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/app")} variant="outline">
              ← Home
            </Button>
            <Button onClick={() => navigate("/app/edit")} variant="outline">
              Edit Board
            </Button>
          </div>
        </div>

        <div className="flex min-h-[600px] items-center justify-center rounded-lg border border-border/70 bg-background/95 p-8 shadow-lg">
          <p className="text-muted-foreground">
            PDF preview will be implemented here
          </p>
        </div>
      </div>
    </div>
  )
}
