import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import AdminDashboard from "./components/AdminDashboard"
import EmployeeDashboard from "./components/EmployeeDashboard"
import LandingPage from "./components/LandingPage"

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
          {/* Route publique */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Routes pour les dashboards */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />

          {/* Route catch-all pour les 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
