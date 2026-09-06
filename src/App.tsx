import { Navigate, Route, Routes } from "react-router-dom"
import GlobalApps from "./GlobalApps"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sga" replace />} />
      <Route path="/sga" element={<GlobalApps />} />
      <Route path="/global-apps" element={<GlobalApps />} />
      <Route path="*" element={<Navigate to="/sga" replace />} />
    </Routes>
  )
}
