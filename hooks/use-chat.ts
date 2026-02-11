
"use client";

import { useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isStreaming?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export function useChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<string>(""); // New status state
  const abortRef = useRef<AbortController | null>(null);

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isPending) return;

    // Abort any ongoing stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    // Create placeholder for assistant response
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsPending(true);
    setStatus("Thinking..."); // Initial status

    try {
      // Build API messages from history (excluding the streaming placeholder)
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete chunk

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6); // Remove "data: " prefix

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "status") {
              // Update status message
              setStatus(event.content);
            } else if (event.type === "text") {
              // Clear status once text starts arriving (optional, or keep showing it until done)
              setStatus("Generating response..."); 
              
              // Append text chunk to assistant message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + event.content }
                    : msg
                )
              );
            } else if (event.type === "done") {
              // Mark streaming as complete
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              setStatus(""); // Clear status
            } else if (event.type === "error") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: event.content, isStreaming: false }
                    : msg
                )
              );
              setStatus("");
            }
            // "opportunities" type is handled silently (context already in text)
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Ensure streaming flag is cleared
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
      setStatus("");
    } catch (error: any) {
      if (error.name === "AbortError") return;

      console.error("Chat stream error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
      setStatus("");
    } finally {
      setIsPending(false);
      setStatus("");
    }
  }, [messages, isPending]);

  return {
    isOpen,
    toggleChat,
    messages,
    sendMessage,
    isPending,
    status, // Export status
  };
}
