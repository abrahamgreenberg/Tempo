import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Switch } from "@/components/ui/switch"
import { Kbd } from "@/components/ui/kbd"
import { useTheme } from "@/components/theme-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}

export function Footer() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const previousPathRef = useRef<string>("/app")

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Track previous path when not in preview
  useEffect(() => {
    if (location.pathname !== "/app/preview") {
      previousPathRef.current = location.pathname
    }
  }, [location.pathname])

  // Keyboard listener for "p" to toggle preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() === "p") {
        event.preventDefault()

        if (location.pathname === "/app/preview") {
          // Go back to previous location
          navigate(previousPathRef.current)
        } else {
          // Go to preview
          navigate("/app/preview")
        }
      }

      if (event.key.toLowerCase() === "e") {
        event.preventDefault()

        if (location.pathname !== "/app/edit") {
          navigate("/app/edit")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [navigate, location.pathname])

  const toggleDarkMode = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const keys = {
    p: "Go to PDF preview",
    d: "Toggle dark mode",
    e: "Go to edit page",
  }

  return (
    <footer className="fixed right-0 bottom-0 left-0 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dark Mode</span>
            <Switch
              checked={isDark}
              onCheckedChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            <HugeiconsIcon
              icon={isDark ? Moon02Icon : Sun03Icon}
              size={16}
              className="text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Keyboard shortcuts:</span>
            {Object.entries(keys).map(([key, description]) => (
              <div key={key} className="flex items-center gap-1">
                <Kbd>{key.toUpperCase()}</Kbd>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
