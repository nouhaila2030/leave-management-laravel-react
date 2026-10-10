// Script de test pour l'authentification
export const testAuth = async () => {
  console.log("🧪 Test d'authentification...")

  // Test 1: Vérifier le localStorage
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")

  console.log("📦 LocalStorage:", {
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token ? token.length : 0,
  })

  if (!token) {
    console.log("❌ Pas de token trouvé")
    return false
  }

  // Test 2: Vérifier avec le serveur
  try {
    const response = await fetch("http://localhost:8000/api/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    console.log("📡 Réponse serveur:", response.status)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Utilisateur authentifié:", data.user)
      return true
    } else {
      console.log("❌ Token invalide")
      return false
    }
  } catch (error) {
    console.error("💥 Erreur réseau:", error)
    return false
  }
}

// Fonction pour nettoyer l'authentification
export const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  console.log("🧹 Authentification nettoyée")
}
