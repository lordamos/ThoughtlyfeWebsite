import { Routes, Route } from "react-router-dom"
import ScrollController from "./ScrollController"
import Header from "./Header"
import Home from "./Home"
import Lab from "./Lab"

export default function App() {
  return (
    <>
      <ScrollController />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
    </>
  )
}
