import { createContext, useContext, useState } from "react"

// create authentication context
// used to share auth state across entire app
const AuthContext = createContext(null)

// provider component
// wraps the app and provides auth data/functions
export const AuthProvider = ({ children }) => {
    // initialize from local storage so auth survives page refresh
    const[user, setUser] = useState(() => {
        const stored = localStorage.getItem("craveo_user")
        return stored ? JSON.parse(stored) : null 
    })
    // initialize JWT token from localStorage
    const [token, setToken] = useState(() => {      
        return localStorage.getItem("craveo_token") || null
})
    // called after successful login/signup
    const login = (userData, jwtToken) => {
        // update react state
        setUser(userData)
        setToken(jwtToken)
        // persist auth data in browser storage
        localStorage.setItem("craveo_user", JSON.stringify(userData))
        localStorage.setItem("craveo_token", jwtToken)
    }

    // called when user logs out
    const logout = () => {
        // clear react state
        setUser(null)
        setToken(null)
        // remove saved auth data
        localStorage.removeItem("craveo_user")
        localStorage.removeItem("craveo_token")
    }

    return (
        // make auth state/functions available globally
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {/*render wrapped components*/}
            {children}
        </AuthContext.Provider>
    )   
}

// custom hook - clean way to consume context anywhere
// avoids importing useContext everywhere
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }
    return context
}