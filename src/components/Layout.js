"use client"
import { useAuth } from "../contexts/AuthContext"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../utils/api"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    if (user && user.role !== "admin") {
      fetchUnreadNotifications()
    }
  }, [user])

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/notifications")
      const unread = response.data.filter((n) => !n.is_read).length
      setUnreadNotifications(unread)
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname === path ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="fas fa-building text-white text-2xl mr-3"></i>
              <div>
                <h1 className="text-white text-xl font-bold">Portail de gestion des congés</h1>
                <p className="text-blue-100 text-sm">Administration publique</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">
                <i className="fas fa-user mr-2"></i>
                {user?.full_name}
              </span>
              {/* Notifications badge pour les employés */}
              {user?.role !== "admin" && unreadNotifications > 0 && (
                <Link to="/notifications" className="relative text-white hover:text-blue-200">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/dashboard")}`}
                  >
                    <i className="fas fa-tachometer-alt mr-3"></i>
                    Tableau de bord
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leave-request"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/leave-request")}`}
                  >
                    <i className="fas fa-plus mr-3"></i>
                    Nouvelle demande
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leave-history"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/leave-history")}`}
                  >
                    <i className="fas fa-history mr-3"></i>
                    Historique
                  </Link>
                </li>
                {/* Notifications pour les employés */}
                {user?.role !== "admin" && (
                  <li>
                    <Link
                      to="/notifications"
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/notifications")}`}
                    >
                      <i className="fas fa-bell mr-3"></i>
                      Notifications
                      {unreadNotifications > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                {user?.role === "admin" && (
                  <>
                    <li className="pt-4">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Administration
                      </div>
                    </li>
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/admin/dashboard")}`}
                      >
                        <i className="fas fa-chart-bar mr-3"></i>
                        Dashboard Admin
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/requests"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/admin/requests")}`}
                      >
                        <i className="fas fa-tasks mr-3"></i>
                        Gérer les demandes
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/approved-requests"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/admin/approved-requests")}`}
                      >
                        <i className="fas fa-check-circle mr-3"></i>
                        Demandes approuvées
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </div>
        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}

export default Layout
