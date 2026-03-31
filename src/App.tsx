import { Routes, Route, useLocation } from "react-router-dom"
import ScrollController from "./ScrollController"
import Header from "./Header"
import Home from "./Home"
import Lab from "./Lab"
import Meditation from "./Meditation"
import GlobalApps from "./GlobalApps"

export default function App() {
  const location = useLocation()
  const isMeditation = location.pathname === "/meditation"
  const isGlobalApps = location.pathname === "/global-apps" || location.pathname === "/sga"
  return (
    <>
      <ScrollController />
      {!isMeditation && !isGlobalApps && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/meditation" element={<Meditation />} />
        <Route path="/global-apps" element={<GlobalApps />} />
        <Route path="/sga" element={<GlobalApps />} />
      </Routes>
    </>
  )
}
