import { createContext, useContext, useState, useEffect } from "react"  
import socket from "../services/socketService"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("craveo_user")
    try {
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem("craveo_user")
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem("craveo_token") || null
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("craveo_token")
    if (storedToken && !socket.connected) {
      socket.connect()
    }
  }, [])  // runs once on mount

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem("craveo_user", JSON.stringify(userData))
    localStorage.setItem("craveo_token", jwtToken)
    if (!socket.connected) socket.connect()
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("craveo_user")
    localStorage.removeItem("craveo_token")
    socket.disconnect()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}