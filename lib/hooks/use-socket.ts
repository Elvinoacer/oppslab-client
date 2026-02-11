"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";

/**
 * Hook to subscribe to a Socket.IO room and listen for events
 */
export function useSocketEvent<T = any>(
  room: string | null,
  event: string,
  callback: (data: T) => void
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!room) return;

    const socket = getSocket();

    // Join room
    socket.emit("join", room);

    const handler = (data: T) => {
      savedCallback.current(data);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
      // Optional: Leave room if no other components need it
      // socket.emit("leave", room); 
    };
  }, [room, event]);
}
