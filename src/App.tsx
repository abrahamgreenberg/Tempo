import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { items } from "@/lib/data"
import { useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import { move } from "@dnd-kit/helpers"
import Column from "./Column"
import Item from "./Item"

export function App() {
  const [items, setItems] = useState({
    A: ["A0", "A1", "A2"],
    B: ["B0", "B1"],
    C: [],
  })

  /*     
  
  import { items } from "@/lib/data"

  
  <section className="w-full max-w-6xl rounded-[2.25rem] border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Daily Plan</h1>
          <p className="text-sm text-muted-foreground">
            Your tasks in order inside one grouped board.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {items
            .sort((a, b) => a.position - b.position)
            .map((item, index) => (
              <Card key={item.id} className="h-full">
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardAction className="text-xs font-medium text-muted-foreground">
                    {(index + 1).toString().padStart(2, "0")}
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
        </div> */

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <section className="grid w-full max-w-6xl grid-cols-3 gap-5 rounded-[2.25rem] border border-border/70 bg-background/95 p-5 shadow-lg sm:p-8">
        <DragDropProvider
          onDragOver={(event) => {
            setItems((items) => move(items, event))
          }}
        >
          {Object.entries(items).map(([column, items]) => (
            <Column key={column} id={column}>
              {items.map((id, index) => (
                <Item key={id} id={id} index={index} column={column} />
              ))}
            </Column>
          ))}
        </DragDropProvider>
      </section>
    </div>
  )
}

export default App
