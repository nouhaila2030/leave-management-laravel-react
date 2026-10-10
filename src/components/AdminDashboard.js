"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AdminNavigation from "./AdminNavigation"
const getGreeting = () => {
  const hour = new Date().getHours(); // heure actuelle
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
};
const AdminDashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    utilizationRate: 0,
    recentRequests: [],
    employees: [],
  })
  const [notificationCount, setNotificationCount] = useState(0)
  const navigate = useNavigate()

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      console.log("🔄 Chargement des données admin...")

      const response = await fetch("http://localhost:8000/api/admin/dashboard/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Stats admin reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setStats({
          totalRequests: data.stats.total_requests || 0,
          approvedRequests: data.stats.approved_requests || 0,
          pendingRequests: data.stats.pending_requests || 0,
          rejectedRequests: data.stats.rejected_requests || 0,
          utilizationRate: Math.round((data.stats.approved_requests / Math.max(data.stats.total_requests, 1)) * 100),
          recentRequests: data.recent_requests || [],
          employees: data.employees || [],
        })

        setNotificationCount(data.stats.pending_requests || 0)
        console.log("✅ Stats chargées, demandes en attente:", data.stats.pending_requests)
      } else {
        console.error("❌ Erreur chargement stats:", data)
      }
    } catch (error) {
      console.error("💥 Erreur réseau stats:", error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      console.log("🔍 AdminDashboard - Vérification auth...")

      if (!token || !storedUser) {
        console.log("❌ Pas de token ou user")
        navigate("/login")
        return
      }

      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("👤 User parsé:", JSON.stringify(parsedUser, null, 2))

        if (parsedUser.role !== "admin") {
          console.log("❌ Pas admin")
          localStorage.clear()
          navigate("/login")
          return
        }

        setUser(parsedUser)
        console.log("✅ Admin authentifié:", parsedUser.email)
        console.log("👑 Objet utilisateur principal (AdminDashboard):", JSON.stringify(parsedUser, null, 2))
        await loadDashboardData()
      } catch (error) {
        console.error("💥 Erreur auth:", error)
        localStorage.clear()
        navigate("/login")
      }
      setLoading(false)
    }

    checkAuth()
  }, [navigate, loadDashboardData])

  const handleLogout = () => {
    console.log("🚪 Déconnexion admin")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleAdminActionSuccess = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard admin...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  console.log("AdminDashboard - User object before rendering notification bar:", JSON.stringify(user, null, 2)) // Added log

  return (
    <div className="rounded-lg shadow-lg bg-[#1e3a8a]">
      <AdminNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationCount={notificationCount}
        onLogout={handleLogout}
      />

      {/* Notification Bar */}
<div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
  <div className="max-w-7xl mx-auto flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <span className="text-blue-600">🔔</span>
      <span className="text-blue-800">
        {getGreeting()} <strong>{String(user?.full_name || user?.first_name || "")}</strong>, Vous avez{" "}
        <span className="font-bold text-red-600">{String(notificationCount)} Demande(s) en attente</span>
      </span>
    </div>
  </div>
</div>


      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <DashboardContent stats={stats} onStatClick={setActiveTab} user={user} />}
        {activeTab === "manage-requests" && <ManageRequestsContent onActionSuccess={handleAdminActionSuccess} />}
        {activeTab === "approved-requests" && <ApprovedRequestsContent />}
        {activeTab === "notifications" && <NotificationsContent />}
        {activeTab === "history" && <HistoryContent />}
      </main>
    </div>
  )
}

const DashboardContent = ({ stats, onStatClick, user }) => {
  console.log("DashboardContent - User prop:", JSON.stringify(user, null, 2)) // Added log
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          onClick={() => onStatClick("manage-requests")}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Demandes de Congés Total</p>
              <p className="text-3xl font-bold text-gray-900">{String(stats.totalRequests)}</p>
              <p className="text-xs text-blue-600 mt-1">Cliquez pour voir les détails</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500"
          onClick={() => onStatClick("approved-requests")}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Demandes Approuvées</p>
              <p className="text-3xl font-bold text-gray-900">{String(stats.approvedRequests)}</p>
              <p className="text-xs text-green-600 mt-1">Cliquez pour voir les détails</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux d'Utilisation</p>
              <p className="text-3xl font-bold text-gray-900">{String(stats.utilizationRate)}%</p>
              <p className="text-xs text-purple-600 mt-1">Moyenne générale</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Informations des Employés</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    Nom & Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    CIN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    Département
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                    Congés
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border border-gray-300">
                      <div className="text-sm font-medium text-gray-900">{String(employee.full_name)}</div>
                    </td>
                    <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">{String(employee.cin)}</td>
                    <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">{String(employee.phone)}</td>
                    <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">{String(employee.email)}</td>
                    <td className="px-4 py-3 border border-gray-300">
                      <div className="text-sm text-gray-900">{String(employee.department)}</div>
                      <div className="text-xs text-gray-500">{String(employee.position)}</div>
                    </td>
                    <td className="px-4 py-3 border border-gray-300">
                      <div className="text-sm text-gray-900">
                        Utilisés: <span className="font-semibold text-red-600">{String(employee.usedDays)}</span>
                      </div>
                      <div className="text-sm text-green-600">Restants: {String(employee.remainingDays)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests - Plus grande case */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900">Demandes Récentes</h3>
            <p className="text-sm text-gray-600">Les 5 dernières demandes soumises</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-gray-900">{String(request.employee)}</div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.status === "approved"
                            ? "Approuvée"
                            : request.status === "rejected"
                              ? "Rejetée"
                              : "En attente"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        📅 {String(request.startDate)} → {String(request.endDate)}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        🕒 {String(request.days)} jour{String(request.days) > 1 ? "s" : ""} demandé
                        {String(request.days) > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques en bas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{String(stats.totalRequests)}</div>
            <div className="text-sm text-gray-600">Total Demandes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{String(stats.approvedRequests)}</div>
            <div className="text-sm text-gray-600">Approuvées</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{String(stats.pendingRequests)}</div>
            <div className="text-sm text-gray-600">En Attente</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{String(stats.utilizationRate)}%</div>
            <div className="text-sm text-gray-600">Taux Utilisation</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ManageRequestsContent = ({ onActionSuccess }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Chargement des demandes admin...")

      const response = await fetch("http://localhost:8000/api/admin/leave-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Demandes admin reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setRequests(data.requests || [])
        console.log("✅ Demandes chargées:", data.requests?.length || 0)
      } else {
        setError(data.message || "Erreur lors du chargement")
        console.error("❌ Erreur API:", data)
      }
    } catch (error) {
      console.error("💥 Erreur réseau:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token")
      console.log(`🔄 Mise à jour statut demande ${requestId} vers ${newStatus}`)

      const response = await fetch(`http://localhost:8000/api/admin/leave-requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          admin_comment: newStatus === "approved" ? "Demande approuvée" : "Demande rejetée",
        }),
      })

      const data = await response.json()
      console.log("📡 Réponse mise à jour:", JSON.stringify(data, null, 2))

      if (response.ok) {
        loadRequests()
        if (onActionSuccess) onActionSuccess()
        alert(`Demande ${String(requestId)} ${newStatus === "approved" ? "approuvée" : "rejetée"} avec succès!`)
        console.log("✅ Statut mis à jour")
      } else {
        alert("Erreur lors de la mise à jour: " + (data.message || "Erreur inconnue"))
        console.error("❌ Erreur mise à jour:", data)
      }
    } catch (error) {
      console.error("💥 Erreur réseau mise à jour:", error)
      alert("Erreur de connexion lors de la mise à jour")
    }
  }

  const handleDownloadCertificate = async (requestId) => {
    try {
      const token = localStorage.getItem("token")
      console.log(`🔄 Tentative de téléchargement de l'attestation pour la demande ${requestId}`)

      const response = await fetch(`http://localhost:8000/api/admin/leave-requests/${requestId}/certificate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf", // Indiquer que nous attendons un PDF
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        // Tenter de récupérer le nom de fichier depuis les headers si disponible
        const contentDisposition = response.headers.get("Content-Disposition")
        let filename = `attestation_conge_${requestId}.pdf`
        if (contentDisposition && contentDisposition.indexOf("filename=") !== -1) {
          filename = contentDisposition.split("filename=")[1].split(";")[0].replace(/"/g, "")
        }
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        console.log(`✅ Attestation PDF pour la demande ${requestId} téléchargée.`)
      } else {
        const errorData = await response.json()
        alert("Erreur lors du téléchargement de l'attestation: " + (errorData.message || "Erreur inconnue"))
        console.error("❌ Erreur téléchargement attestation:", errorData)
      }
    } catch (error) {
      console.error("💥 Erreur réseau téléchargement attestation:", error)
      alert("Erreur de connexion lors du téléchargement de l'attestation.")
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button onClick={loadRequests} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <h3 className="text-lg font-semibold text-gray-900">Gérer les Demandes de Congés</h3>
        <p className="text-sm text-gray-600">Approuver ou rejeter les demandes des employés</p>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune demande trouvée</p>
          <p className="text-sm mt-2">Les demandes des employés apparaîtront ici</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  ID demande
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Employé
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Date départ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Date retour
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Nbr jours
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Solde congés
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  État
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300 text-sm font-medium text-gray-900">
                    {String(request.id)}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    <div className="text-sm font-medium text-gray-900">
                      {String(
                        request.employee?.full_name || request.employee?.first_name + " " + request.employee?.last_name,
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{String(request.employee?.email)}</div>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900 capitalize">
                    {String(request.leave_type)}
                  </td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300">
  {new Date(request.start_date).toLocaleDateString('fr-FR')}
</td>
<td className="px-4 py-4 text-center border-2 border-gray-300">
  {new Date(request.end_date).toLocaleDateString('fr-FR')}
</td>

                  <td className="px-4 py-3 border border-gray-300 text-sm font-semibold text-blue-600">
                    {String(request.total_days)}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-sm text-green-600 font-medium">
                    Restant: {String(request.employee_balance?.remainingDays || "N/A")}
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status === "approved"
                        ? "Acceptée"
                        : request.status === "rejected"
                          ? "Refusée"
                          : "En cours de traitement"}
                    </span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300">
                    {request.status === "pending" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(request.id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          ✓ Confirmer
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          ✗ Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <span className="text-xs text-gray-500">Traitée</span>
                        {request.status === "approved" && ( // Afficher le bouton seulement si la demande est approuvée
                          <button
                            onClick={() => handleDownloadCertificate(request.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            title="Télécharger l'attestation"
                          >
                            
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const ApprovedRequestsContent = () => {
  const [approvedRequests, setApprovedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadApprovedRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Chargement des demandes approuvées admin...")

      const response = await fetch("http://localhost:8000/api/admin/approved-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Demandes approuvées reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setApprovedRequests(data.requests || [])
        console.log("✅ Demandes approuvées chargées:", data.requests?.length || 0)
      } else {
        setError(data.message || "Erreur lors du chargement")
        console.error("❌ Erreur API:", data)
      }
    } catch (error) {
      console.error("💥 Erreur réseau:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApprovedRequests()
  }, [loadApprovedRequests])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des demandes approuvées...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button
            onClick={loadApprovedRequests}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
        <h3 className="text-lg font-semibold text-gray-900">Demandes Approuvées</h3>
        <p className="text-sm text-gray-600">Liste de toutes les demandes approuvées</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                Employé
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                Période
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                Jours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">
                Date d'approbation
              </th>
            </tr>
          </thead>
          <tbody>
            {approvedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-300 text-sm font-medium text-gray-900">
                  {String(request.id)}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  <div className="text-sm font-medium text-gray-900">
                    {String(
                      request.employee?.full_name || request.employee?.first_name + " " + request.employee?.last_name,
                    )}
                  </div>
                  <div className="text-xs text-gray-500">CIN: {String(request.employee?.cin || "N/A")}</div>
                </td>
                <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                  {String(request.start_date)} → {String(request.end_date)}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-sm font-semibold text-green-600">
                  {String(request.total_days)}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-sm text-gray-900">
                  {new Date(request.approved_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Chargement des notifications admin...")

      const response = await fetch("http://localhost:8000/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Notifications admin reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setNotifications(data.notifications || [])
        console.log("✅ Notifications admin chargées:", data.notifications?.length || 0)
      } else {
        setError(data.message || "Erreur lors du chargement")
        console.error("❌ Erreur API:", data)
      }
    } catch (error) {
      console.error("💥 Erreur réseau:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      loadNotifications()
    } catch (error) {
      console.error("Erreur marquage lu:", error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button
            onClick={loadNotifications}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <p className="text-sm text-gray-600">Vos notifications récentes</p>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune notification</p>
            <p className="text-sm mt-2">Vos notifications apparaîtront ici</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`p-6 ${!notification.is_read ? "bg-blue-50" : ""}`}>
              <div className="flex items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{String(notification.title)}</h4>
                  <p className="mt-1 text-sm text-gray-600">{String(notification.message)}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const HistoryContent = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
        <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
        <p className="text-sm text-gray-600">Historique complet des demandes</p>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
      </div>
    </div>
  )
}

export default AdminDashboard
