import { io } from "socket.io-client"

const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

// singleton — created once, reused everywhere
const socket = io(BACKEND_URL, {
  autoConnect: false,  // connect manually on login
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export default socket