"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const AdminRequests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  // Fonction locale pour formater les dates
  const formatDateFR = (date) => {
    return new Date(date).toLocaleDateString("fr-FR")
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/admin/requests")
      console.log("📦 Demandes reçues:", response.data)
      setRequests(response.data)
    } catch (error) {
      console.error("❌ Erreur lors du chargement des demandes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    const comment = prompt("💬 Commentaire d'approbation (optionnel):")

    setProcessingId(requestId)
    try {
      await api.put(`/admin/requests/${requestId}/approve`, { comment })
      alert("✅ Demande approuvée avec succès! L'employé a été notifié.")
      fetchPendingRequests() // Recharger la liste
    } catch (error) {
      console.error("❌ Erreur lors de l'approbation:", error)
      alert("❌ Erreur lors de l'approbation")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    const comment = prompt("❌ Motif du refus (obligatoire):")
    if (!comment) {
      alert("⚠️ Le motif du refus est obligatoire")
      return
    }

    setProcessingId(requestId)
    try {
      await api.put(`/admin/requests/${requestId}/reject`, { comment })
      alert("❌ Demande refusée. L'employé a été notifié.")
      fetchPendingRequests() // Recharger la liste
    } catch (error) {
      console.error("❌ Erreur lors du refus:", error)
      alert("❌ Erreur lors du refus")
    } finally {
      setProcessingId(null)
    }
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Retour au Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          <i className="fas fa-tasks mr-3 text-orange-600"></i>
          Demandes en Attente ({requests.length})
        </h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune demande en attente</h3>
          <p className="text-gray-500">Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const employeeBalance = request.employee_balance
            const hasInsufficientBalance = employeeBalance && request.total_days > employeeBalance.remainingDays

            return (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* ✅ Informations employé complètes */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg w-full mr-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          <i className="fas fa-user mr-2 text-blue-600"></i>
                          {request.employee?.full_name ||
                            `${request.employee?.first_name} ${request.employee?.last_name}`}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">📧 Email:</span>
                            <p className="font-medium">{request.employee?.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">📱 Téléphone:</span>
                            <p className="font-medium">{request.employee?.phone || "Non renseigné"}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">🏢 Département:</span>
                            <p className="font-medium">{request.employee?.department}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">💼 Poste:</span>
                            <p className="font-medium">{request.employee?.position}</p>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        <i className="fas fa-clock mr-1"></i>
                        En attente
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                          Type de congé
                        </p>
                        <p className="font-semibold">{request.leave_type?.name}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          <i className="fas fa-calendar-day mr-2 text-green-600"></i>
                          Période
                        </p>
                        <p className="font-semibold">
                          {formatDateFR(request.start_date)} - {formatDateFR(request.end_date)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          <i className="fas fa-clock mr-2 text-purple-600"></i>
                          Durée demandée
                        </p>
                        <p className="font-semibold text-purple-600">{request.total_days} jour(s) ouvrables</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          <i className="fas fa-calendar-plus mr-2 text-blue-600"></i>
                          Demandé le
                        </p>
                        <p className="font-semibold">{formatDateFR(request.created_at)}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-comment mr-2 text-blue-600"></i>
                        Motif
                      </p>
                      <p className="text-gray-800">{request.reason}</p>
                    </div>

                    {request.replacement_employee && (
                      <div className="mt-3 bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          <i className="fas fa-user-friends mr-2 text-green-600"></i>
                          Remplaçant
                        </p>
                        <p className="text-gray-800">{request.replacement_employee}</p>
                      </div>
                    )}
                  </div>

                  {/* ✅ Solde de congés corrigé */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
                      Solde de Congés {new Date().getFullYear()}
                    </h4>
                    {employeeBalance ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total annuel:</span>
                          <span className="font-semibold text-blue-600">{employeeBalance.totalDays} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Déjà utilisés:</span>
                          <span className="font-semibold text-orange-600">{employeeBalance.usedDays} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Restants:</span>
                          <span
                            className={`font-semibold ${employeeBalance.remainingDays < request.total_days ? "text-red-600" : "text-green-600"}`}
                          >
                            {employeeBalance.remainingDays} jours
                          </span>
                        </div>

                        {hasInsufficientBalance && (
                          <div className="bg-red-100 border border-red-300 rounded p-2 mt-2">
                            <p className="text-red-800 text-xs">
                              <i className="fas fa-exclamation-triangle mr-1"></i>
                              ⚠️ Solde insuffisant! Demande: {request.total_days}j, Disponible:{" "}
                              {employeeBalance.remainingDays}j
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-spinner fa-spin text-gray-400 mb-2"></i>
                        <p className="text-gray-500 text-sm">Calcul du solde...</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {processingId === request.id ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-check mr-2"></i>
                      )}
                      ✅ Approuver
                    </button>

                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>❌ Refuser
                    </button>

                    {hasInsufficientBalance && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                        <p className="text-yellow-800 text-xs text-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          ⚠️ Attention: Solde insuffisant
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminRequests
