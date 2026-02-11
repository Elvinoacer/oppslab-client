"use client";

import { io, Socket } from "socket.io-client";

// Singleton socket instance
let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket"],
    });
    
    // Debug events
    socket.on("connect", () => {
      console.log("[Socket] Connected", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });
    
    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection Error", err);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
