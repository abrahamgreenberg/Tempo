import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted/30 p-6 pb-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to Tempo</h1>
        <p className="text-muted-foreground">Your time-blocking kanban board</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => navigate("/app/edit")} size="lg">
          Edit Board
        </Button>
        <Button
          onClick={() => navigate("/app/preview")}
          variant="secondary"
          size="lg"
        >
          Preview PDF
        </Button>
      </div>
    </div>
  )
}
