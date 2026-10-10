"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import EmployeeNavigation from "./EmployeeNavigation"
import LeaveRequestForm from "./LeaveRequestForm"
const getGreeting = () => {
  const hour = new Date().getHours();
  return hour < 18 ? "Bonjour" : "Bonsoir"; // Avant 18h -> Bonjour, après 18h -> Bonsoir
};
const EmployeeDashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [notificationCount, setNotificationCount] = useState(0)
  const navigate = useNavigate()

  const loadNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await fetch("http://localhost:8000/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const data = await response.json()
      console.log("📡 Notifications count data received:", JSON.stringify(data, null, 2)) // Added log
      if (response.ok) {
        setNotificationCount(data.unread_count)
      }
    } catch (error) {
      console.error("Erreur chargement notifications count:", error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      console.log("🔍 EmployeeDashboard - Vérification auth...")

      if (!token || !storedUser) {
        console.log("❌ Pas de token ou user")
        navigate("/login")
        return
      }

      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("👤 User parsé:", JSON.stringify(parsedUser, null, 2)) // Added log

        if (parsedUser.role !== "employee") {
          console.log("❌ Pas employee")
          localStorage.clear()
          navigate("/login")
          return
        }

        setUser(parsedUser)
        console.log("✅ Employee authentifié:", parsedUser.email)
        console.log("👤 Objet utilisateur principal (EmployeeDashboard):", JSON.stringify(parsedUser, null, 2))
        loadNotificationCount()
      } catch (error) {
        console.error("💥 Erreur auth:", error)
        localStorage.clear()
        navigate("/login")
      }
      setLoading(false)
    }

    checkAuth()
  }, [navigate, loadNotificationCount])

  const handleLogout = () => {
    console.log("🚪 Déconnexion employee")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleRequestSuccess = useCallback(() => {
    if (activeTab === "my-requests") {
      // Forcer le rechargement de MyRequestsContent si nécessaire
    }
    loadNotificationCount()
  }, [activeTab, loadNotificationCount])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard employé...</p>
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

  return (
    <div className="rounded-lg shadow-lg bg-[#1e3a8a]">
      <EmployeeNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationCount={notificationCount}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "home" && <HomeContent user={user} />}
        {activeTab === "request-leave" && <LeaveRequestForm onSuccess={handleRequestSuccess} />}
        {activeTab === "my-requests" && <MyRequestsContent />}
        {activeTab === "notifications" && <NotificationsContent />}
      </main>
    </div>
  )
}

const HomeContent = ({ user }) => {
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        const data = await response.json()
        console.log("📡 Données /api/me reçues (HomeContent):", JSON.stringify(data, null, 2))
        if (response.ok) {
          const balanceResponse = await fetch("http://localhost:8000/api/my-requests", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          })
          const balanceData = await balanceResponse.json()
          console.log("📡 Données /api/my-requests reçues (HomeContent):", JSON.stringify(balanceData, null, 2))
          if (balanceResponse.ok && balanceData.balance) {
            setEmployeeData({
              ...data.user,
              totalDays: balanceData.balance.totalDays,
              usedDays: balanceData.balance.usedDays,
              remainingDays: balanceData.balance.remainingDays,
            })
          } else {
            setEmployeeData(data.user)
          }
        } else {
          setError(data.message || "Erreur lors du chargement des informations de l'employé")
        }
      } catch (err) {
        setError("Erreur de connexion au serveur pour les informations de l'employé.")
      } finally {
        setLoading(false)
      }
    }
    loadEmployeeData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des informations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center text-red-600">
        <p>❌ {error}</p>
      </div>
    )
  }

  if (!employeeData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
        Aucune donnée d'employé disponible.
      </div>
    )
  }

  console.log("🏠 employeeData avant rendu (HomeContent):", JSON.stringify(employeeData, null, 2))
  return (
    
<div className="max-w-2xl mx-auto">
  <div className="bg-white rounded-lg shadow">
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
  <div className="max-w-7xl mx-auto flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <span className="text-blue-600"></span>
      <span className="text-blue-800">
        {getGreeting()} <strong>{String(user?.full_name || user?.first_name || "")}</strong>👋, bienvenue à votre portail
      </span>
    </div>
  </div>
</div>
    {/* Header */}
    <div className="px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-sky-400 to-indigo-600">
      <div className="flex items-center justify-center">
        <div className="bg-white p-2 rounded-full mr-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Vos Coordonnées</h3>
      </div>
    </div>

    {/* Tableau */}
    <div className="p-4">
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              CIN
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.cin || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Nom
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.last_name)}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Prénom
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.first_name)}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Login
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.email)}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Grade
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.position || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Division
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.department || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Tél
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.phone || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Adresse
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.address || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              Email
            </td>
            <td className="py-2 px-3 text-gray-900 border text-center font-medium">
              {String(employeeData.email)}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              JrsTotal
            </td>
            <td className="py-2 px-3 text-blue-600 border text-center font-bold">
              {String(employeeData.totalDays || "N/A")}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-3 bg-gray-100 font-semibold text-gray-700 border text-center">
              JrsRestants
            </td>
            <td className="py-2 px-3 text-green-600 border text-center font-bold">
              {String(employeeData.remainingDays || "N/A")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
  )
}

const MyRequestsContent = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [balance, setBalance] = useState(null)

  const loadMyRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Chargement des demandes employé...")

      const response = await fetch("http://localhost:8000/api/my-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Mes demandes reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setRequests(data.requests || [])
        setBalance(data.balance)
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
    loadMyRequests()
  }, [loadMyRequests])

  const handleDownloadCertificate = async (requestId) => {
    try {
      const token = localStorage.getItem("token")
      console.log(`🔄 Tentative de téléchargement de l'attestation pour la demande ${requestId}`)
      console.log(`🔍 Token utilisé pour le téléchargement: ${token ? token.substring(0, 10) + "..." : "Absent"}`) // Log du token (partiel pour la sécurité)

      const response = await fetch(`http://localhost:8000/api/leave-requests/${requestId}/certificate`, {
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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement de vos demandes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button onClick={loadMyRequests} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-400 to-indigo-600">

        <h3 className="text-xl font-bold text-white text-center">Mes Demandes de Congé</h3>
      </div>

      {balance && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Votre solde de congés {String(balance.year)}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{String(balance.totalDays)}</div>
              <div className="text-gray-600">Total annuel</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{String(balance.usedDays)}</div>
              <div className="text-gray-600">Jours utilisés</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{String(balance.remainingDays)}</div>
              <div className="text-gray-600">Jours restants</div>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune demande trouvée</p>
          <p className="text-sm mt-2">Vos demandes de congé apparaîtront ici</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-2 border-gray-300">
                  ID demande
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-2 border-gray-300">Type</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-2 border-gray-300">
                  Date départ
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-2 border-gray-300">
                  Date retour
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-2 border-gray-300">
                  Nbr jours
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase border border-gray-300">
                  État
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase border border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-center border-2 border-gray-300 font-medium">{String(request.id)}</td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300 capitalize">
                    {String(request.leave_type)}
                  </td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300">{String(request.start_date)}</td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300">{String(request.end_date)}</td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300 font-semibold text-blue-600">
                    {String(request.total_days)}
                  </td>
                  <td className="px-4 py-4 text-center border-2 border-gray-300">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
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
                  <td className="px-4 py-4 text-center border-2 border-gray-300">
                    {request.status === "approved" && (
                      <button
                        onClick={() => handleDownloadCertificate(request.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        title="Télécharger l'attestation"
                      >
                        ⬇️ PDF
                      </button>
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

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔄 Chargement des notifications...")

      const response = await fetch("http://localhost:8000/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Notifications reçues:", JSON.stringify(data, null, 2))

      if (response.ok) {
        setNotifications(data.notifications || [])
        console.log("✅ Notifications chargées:", data.notifications?.length || 0)
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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
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
    
    <div className="bg-white rounded-lg shadow-lg">
     <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-400 to-indigo-600">

        <h3 className="text-xl font-bold text-white text-center">Mes Notifications</h3>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune notification</p>
          <p className="text-sm mt-2">Vos notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 ${!notification.is_read ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{String(notification.title)}</h4>
                  <p className="mt-2 text-gray-600">{String(notification.message)}</p>
                  <p className="mt-3 text-sm text-gray-500">
                    📅 {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.is_read && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-600">Nouveau</span>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Marquer comme lu
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboard
