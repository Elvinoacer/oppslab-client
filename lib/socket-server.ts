import { io } from "socket.io-client";

// This runs on the Next.js server (backend) to trigger events on the standalone socket server
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:4000";
const ADMIN_SECRET = process.env.SOCKET_ADMIN_SECRET || "admin-secret-key";

// Create a persistent connection for the backend to emit events
const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("[Backend] Connected to Socket Server");
});

export const triggerSocketEvent = async (room: string, event: string, payload: any) => {
  if (!socket.connected) {
    socket.connect();
    // Wait briefly for connection (optional, or just emit and let it buffer)
  }
  
  socket.emit("backend:trigger", {
    secret: ADMIN_SECRET,
    room,
    event,
    payload
  });
};
