"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.backgroundColor = "#1e3a8a"
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        navigate(data.user.role === "admin" ? "/admin-dashboard" : "/employee-dashboard")
      } else {
        setError(data.message || "Erreur de connexion")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur. Vérifiez votre connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center py-10"
      style={{ backgroundColor: "#1e3a8a" }}
    >
      {/* En-tête neutre */}
      <div className="text-center text-white mb-8">
        <h1 className="text-xl font-bold">Portail de gestion des congés</h1>
        <p className="text-sm text-blue-200 mt-1">Administration publique</p>
      </div>

      {/* Bloc login */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-10 w-full max-w-md text-gray-900">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Connexion
        </h2>
        <p className="text-center mb-8 text-gray-600">Accès réservé aux agents</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-semibold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
            }`}
            style={{ backgroundColor: loading ? "#cbd5e1" : "#1e3a8a" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
