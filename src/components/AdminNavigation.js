"use client"

const AdminNavigation = ({ activeTab, setActiveTab, notificationCount = 0, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
    { id: "manage-requests", label: "Gérer les demandes", icon: "📋" },
    { id: "approved-requests", label: "Demandes approuvées", icon: "✅" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: notificationCount },
  ]

  return (
    <header className="relative" style={{ backgroundColor: "#1e3a8a" }}>
      <div className="flex justify-center py-4 shadow-sm" style={{ backgroundColor: "#1e3a8a" }}>
        <div className="flex items-center space-x-8 max-w-4xl mx-4">
          <div className="text-center text-white leading-snug">
            <h2 className="text-base font-semibold">Portail de gestion des congés</h2>
            <h3 className="text-sm font-medium">Administration publique</h3>
            <h4 className="text-sm font-normal">Espace administrateur</h4>
          </div>
        </div>
      </div>

      <nav className="relative shadow-sm border-b bg-gray-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-black hover:text-black hover:bg-white/50"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default AdminNavigation
