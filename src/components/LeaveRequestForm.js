"use client"

import { useState, useEffect } from "react"

const LeaveRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dayCalculation, setDayCalculation] = useState(null)
  const [balance, setBalance] = useState(null)

  // Calculer les jours automatiquement quand les dates changent
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      calculateDays()
    } else {
      setDayCalculation(null)
    }
  }, [formData.start_date, formData.end_date])

  const calculateDays = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/calculate-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_date: formData.start_date,
          end_date: formData.end_date,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setDayCalculation(data)
      }
    } catch (error) {
      console.error("Erreur calcul jours:", error)
    }
  }

  // Charger le solde au montage du composant
  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/my-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setBalance(data.balance)
      }
    } catch (error) {
      console.error("Erreur chargement solde:", error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      console.log("🔍 Token pour demande de congé:", token ? "Présent" : "Absent", token)
      console.log("🔄 Envoi de la demande:", formData)
      const response = await fetch("http://localhost:8000/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Demande de congé envoyée avec succès!")
        setFormData({
          leave_type: "",
          start_date: "",
          end_date: "",
          reason: "",
        })
        setDayCalculation(null)
        loadBalance() // Recharger le solde
        if (onSuccess) onSuccess()
      } else {
        setError(data.message || "Erreur lors de l'envoi de la demande")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nouvelle demande de congé</h2>

      {/* Affichage du solde */}
      {balance && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Votre solde de congés {balance.year}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{balance.totalDays}</div>
              <div className="text-gray-600">Total annuel</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{balance.usedDays}</div>
              <div className="text-gray-600">Jours utilisés</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{balance.remainingDays}</div>
              <div className="text-gray-600">Jours restants</div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de congé</label>
          <select
            name="leave_type"
            value={formData.leave_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner le type</option>
            <option value="annual">Congé annuel</option>
            <option value="sick">Congé maladie</option>
            <option value="maternity">Congé maternité</option>
            <option value="emergency">Congé d'urgence</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              min={getTodayDate()}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || getTodayDate()}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Affichage du calcul des jours */}
        {dayCalculation && (
          <div
            className={`p-4 rounded-lg ${dayCalculation.can_take ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Jours ouvrables demandés:</span>
              <span className={`font-bold ${dayCalculation.can_take ? "text-green-600" : "text-red-600"}`}>
                {dayCalculation.working_days} jour{dayCalculation.working_days > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>• Weekends et jours fériés exclus</p>
              <p>• Jours restants après cette demande: {dayCalculation.remaining_days - dayCalculation.working_days}</p>
            </div>
            {!dayCalculation.can_take && (
              <div className="mt-2 text-red-600 font-medium">⚠️ Solde insuffisant pour cette période</div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Expliquez le motif de votre demande..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || (dayCalculation && !dayCalculation.can_take)}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading || (dayCalculation && !dayCalculation.can_take)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          } text-white`}
        >
          {loading ? "Envoi en cours..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  )
}

export default LeaveRequestForm
