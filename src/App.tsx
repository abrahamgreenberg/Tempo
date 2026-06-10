import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { EditPage } from "@/pages/EditPage"
import { PreviewPage } from "@/pages/PreviewPage"
import { Footer } from "@/components/Footer"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<HomePage />} />
        <Route path="/app/edit" element={<EditPage />} />
        <Route path="/app/preview" element={<PreviewPage />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
