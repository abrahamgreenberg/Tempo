import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { HomePage } from "@/pages/HomePage"
import { EditPage } from "@/pages/EditPage"
import { PreviewPage } from "@/pages/PreviewPage"
import { Footer } from "@/components/Footer"
import { Provider } from "react-redux"

import { store } from "@/store"
export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/app" element={<HomePage />} />
          <Route path="/app/edit" element={<EditPage />} />
          <Route path="/app/preview" element={<PreviewPage />} />
          <Route path="/" element={<Navigate to="/app" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </Provider>
  )
}

export default App
