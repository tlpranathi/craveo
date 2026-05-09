import { createContext, useContext, useState } from "react"

// create the context
const AuthContext = createContext(null)

// provider - wraps your whole app
export const AuthProvider = ({ children }) => {
    // initialize from local storage so auth survives page refresh
    const[user, setUser] = useState(() => {
        const stored = localStorage.getItem("craveo_user")
        return stored ? JSON.parse(stored) : null 
    })

    const [token, setToken] = useState(() => {         // ← must be here, before login/logout
        return localStorage.getItem("craveo_token") || null
})

    const login = (userData, jwtToken) => {
        setUser(userData)
        setToken(jwtToken)
        localStorage.setItem("craveo_user", JSON.stringify(userData))
        localStorage.setItem("craveo_token", jwtToken)
    }

    // called on logout
    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("craveo_user")
        localStorage.removeItem("craveo_token")
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )   
}

// custom hook - clean way to consume context anywhere
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }
    return context
}