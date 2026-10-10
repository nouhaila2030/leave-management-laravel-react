"use client"
import { useState, useEffect } from "react"
import api from "../utils/api"

const LeaveHistory = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaveHistory()
  }, [])

  const fetchLeaveHistory = async () => {
    try {
      const response = await api.get("/history")
      setRequests(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-orange-100 text-orange-800",
        icon: "fas fa-clock",
        text: "En attente",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: "fas fa-check-circle",
        text: "Approuvée",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: "fas fa-times-circle",
        text: "Refusée",
      },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <i className={`${config.icon} mr-1`}></i>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        <i className="fas fa-history mr-3 text-blue-600"></i>
        Historique des Demandes
      </h1>

      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-500">Vous n'avez pas encore soumis de demande de congé.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                    {request.leave_type?.name || "Type non défini"}
                  </h3>
                  <p className="text-gray-600">
                    <i className="fas fa-calendar mr-2"></i>
                    Du {new Date(request.start_date).toLocaleDateString("fr-FR")}
                    au {new Date(request.end_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    <i className="fas fa-clock mr-2 text-purple-600"></i>
                    Durée
                  </p>
                  <p className="font-semibold text-purple-600">{request.total_days} jour(s)</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    <i className="fas fa-calendar-plus mr-2 text-green-600"></i>
                    Demandé le
                  </p>
                  <p className="font-semibold">{new Date(request.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                {request.approved_at && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      <i className="fas fa-check mr-2 text-blue-600"></i>
                      Traité le
                    </p>
                    <p className="font-semibold">{new Date(request.approved_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-comment mr-2 text-blue-600"></i>
                  Motif
                </p>
                <p className="text-gray-800">{request.reason}</p>
              </div>

              {request.replacement_employee && (
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-user-friends mr-2 text-green-600"></i>
                    Remplaçant
                  </p>
                  <p className="text-gray-800">{request.replacement_employee}</p>
                </div>
              )}

              {request.admin_comment && (
                <div className={`p-4 rounded-lg ${request.status === "approved" ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <i
                      className={`fas ${request.status === "approved" ? "fa-thumbs-up" : "fa-comment-slash"} mr-2`}
                    ></i>
                    Commentaire administrateur
                  </p>
                  <p className="text-gray-800">{request.admin_comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeaveHistory
