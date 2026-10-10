"use client"
import { useState, useEffect } from "react"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"

const ApprovedRequests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {  
    fetchApprovedRequests()
  }, [])  

  const fetchApprovedRequests = async () => {
    try {
      const response = await api.get("/admin/approved-requests")
      setRequests(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des demandes approuvées:", error)
    } finally {
      setLoading(false)
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
          <i className="fas fa-check-circle mr-3 text-green-600"></i>
          Demandes Approuvées ({requests.length})
        </h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <i className="fas fa-check-circle text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune demande approuvée</h3>
          <p className="text-gray-500">Aucune demande n'a encore été approuvée.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        <i className="fas fa-user mr-2 text-blue-600"></i>
                        {request.employee?.full_name}
                      </h3>
                      <p className="text-gray-600">{request.employee?.department}</p>
                      <p className="text-sm text-gray-500">{request.employee?.position}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <i className="fas fa-check mr-1"></i>
                      Approuvée
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
                        {new Date(request.start_date).toLocaleDateString("fr-FR")} -{" "}
                        {new Date(request.end_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        <i className="fas fa-clock mr-2 text-purple-600"></i>
                        Durée
                      </p>
                      <p className="font-semibold text-purple-600">{request.total_days} jour(s)</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        <i className="fas fa-calendar-check mr-2 text-green-600"></i>
                        Approuvée le
                      </p>
                      <p className="font-semibold">{new Date(request.approved_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-comment mr-2 text-blue-600"></i>
                      Motif
                    </p>
                    <p className="text-gray-800">{request.reason}</p>
                  </div>

                  {request.admin_comment && (
                    <div className="mt-3 bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-thumbs-up mr-2 text-green-600"></i>
                        Commentaire d'approbation
                      </p>
                      <p className="text-gray-800">{request.admin_comment}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-center bg-green-50 rounded-lg p-4">
                  <i className="fas fa-check-circle text-6xl text-green-600 mb-4"></i>
                  <p className="text-green-800 font-semibold text-center">Demande Approuvée</p>
                  <p className="text-green-600 text-sm text-center mt-2">Cette demande a été traitée et approuvée</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApprovedRequests
