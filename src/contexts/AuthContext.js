"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Configurer le token dans les headers API
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Vérifier si le token est valide
      checkAuthStatus()
    } else {
      delete api.defaults.headers.common["Authorization"]
      setIsLoading(false)
    }
  }, [token])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/me")
      setUser(response.data.user)

      // Rediriger selon le rôle
      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("❌ Token invalide:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log("🔐 Tentative de connexion:", email)

      const response = await api.post("/login", {
        email,
        password,
      })

      console.log("✅ Réponse de connexion:", response.data)

      const { user: userData, token: userToken } = response.data

      // Sauvegarder le token et l'utilisateur
      setToken(userToken)
      setUser(userData)
      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))

      // Configurer le header Authorization
      api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`

      // Rediriger selon le rôle
      if (userData.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/dashboard")
      }

      return userData
    } catch (error) {
      console.error("❌ Erreur de connexion:", error)

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response?.status === 401) {
        throw new Error("Email ou mot de passe incorrect")
      } else if (error.response?.status === 500) {
        throw new Error("Erreur serveur. Veuillez réessayer.")
      } else {
        throw new Error("Erreur de connexion. Vérifiez votre connexion internet.")
      }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.post("/logout")
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      // Nettoyer les données locales
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]
      navigate("/login")
    }
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
