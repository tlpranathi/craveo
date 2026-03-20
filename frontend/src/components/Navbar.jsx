import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav style={{padding: "10px", borderBottom: "1px solid black", display: "flex", gap: "20px"}}>
            <Link to = "/">feedMe</Link> | {" "}
            <Link to = "/login">Login</Link> | {" "}
            <Link to = "/register">Register</Link> | {" "}
            <Link to = "/cart">Cart</Link> | {" "}
            <Link to = "/restaurant">Restaurants</Link>
        </nav>
    );
}