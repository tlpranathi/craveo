import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Restaurant from "./pages/Restaurant";

function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path = "/" element = {<Home />} />
      <Route path = "/login" element = {<Login />} />
      <Route path = "/register" element = {<Register />} />
      <Route path = "/cart" element = {<Cart />} />
      <Route path = "/restaurant/:id" element = {<Restaurant />} />
    </Routes>
    </>
  );
}

export default App;
