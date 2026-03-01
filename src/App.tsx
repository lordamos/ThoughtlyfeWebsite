import { Routes, Route, useLocation } from "react-router-dom"
import ScrollController from "./ScrollController"
import Header from "./Header"
import Home from "./Home"
import Lab from "./Lab"
import Meditation from "./Meditation"

export default function App() {
  const location = useLocation()
  const isMeditation = location.pathname === "/meditation"
  return (
    <>
      <ScrollController />
      {!isMeditation && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/meditation" element={<Meditation />} />
      </Routes>
    </>
  )
}
