import { useState, useEffect } from "react"
import API from "../services/api"

const Profile = () => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("/users/profile")
                setProfile(res.data.data)
                setName(res.data.data.name)
                setEmail(res.data.data.email)
            } catch (err) {
                setError("Failed to load profile")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        try {
            const res = await API.put("/users/profile", {
                name, email
            })
        setProfile(res.data.data)
        setName("")
        setEmail("")
        setSuccess("Profile updated successfully")
        setTimeout(() => {
            setSuccess("")
        }, 3000)
        } catch (err) {
            setError(err.response?.data?.message || "Update failed")
        }
    }

    const handleChangePassword = async(e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        try {
            await API.put("/users/profile/change-password", {
                currentPassword, 
                newPassword,
            })
            setCurrentPassword("")
            setNewPassword("")

            setSuccess("Password updated successfully")
        } catch (err) {
            setError(err.response?.data?.message || "Password update failed")
            setTimeout(() => {
                setError("")
            }, 3000)
        }
    }

    if (loading) return <p>Loading profile...</p>
    
    return (
        <div>
            {error && (<p style={{ color: "red" }}>{error}</p>)}
            {success && (<p style={{ color: "green" }}>{success}</p>)}
        <div style={{ border: "1px solid #252121", margin: "15px", padding: "10px", borderRadius: "10px"}}>
        <h1>My Profile</h1>
        <p><strong>Name: </strong>{profile.name}</p>
        <p><strong>Email: </strong>{profile.email}</p>
        <p><strong>Role: </strong>{profile.role}</p>
        </div>
        <div style={{ border: "1px solid #252121", margin: "15px", padding: "10px", borderRadius: "10px"}}>
        <h3>Edit Profile</h3>
        <form onSubmit={handleUpdateProfile}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/><br></br><br></br>
            <input disabled type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/><br></br><br></br>
            <button type="submit">Save Changes</button>
        </form>
        </div>
        <div style={{ border: "1px solid #252121", margin: "15px", padding: "10px", borderRadius: "10px"}}>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /><br></br><br></br>
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><br></br><br></br>
            <button type="submit">Change Password</button></form>
        </div>
        </div>
    )
}

export default Profile