"use client"
import { useState, useEffect } from "react"
import api from "../utils/api"

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications")
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif)))
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all")
      setNotifications(notifications.map((notif) => ({ ...notif, is_read: true })))
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      success: "fas fa-check-circle text-green-600",
      error: "fas fa-times-circle text-red-600",
      warning: "fas fa-exclamation-triangle text-yellow-600",
      info: "fas fa-info-circle text-blue-600",
    }
    return icons[type] || icons.info
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          <i className="fas fa-bell mr-3 text-blue-600"></i>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-check-double mr-2"></i>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <i className="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune notification</h3>
          <p className="text-gray-500">Vous n'avez pas de nouvelles notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white p-4 rounded-lg shadow border-l-4 cursor-pointer transition-all hover:shadow-md ${
                notification.is_read ? "border-gray-300 opacity-75" : "border-blue-500"
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <i className={`${getNotificationIcon(notification.type)} text-xl mt-1`}></i>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${notification.is_read ? "text-gray-600" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                  </div>
                  <p className={`mt-1 ${notification.is_read ? "text-gray-500" : "text-gray-700"}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
