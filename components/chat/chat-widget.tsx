
"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Zap,
  Search,
  GraduationCap,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  { text: "Find remote React jobs", icon: Search },
  { text: "Suggest a scholarship", icon: GraduationCap },
  { text: "How can I improve my resume?", icon: Zap },
];

export function ChatWidget() {
  const { isOpen, toggleChat, messages, sendMessage, isPending } = useChat();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <>
      {/* ─── Floating Toggle Button ─── */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full transition-all duration-500 ease-out group",
          "shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95",
          isOpen
            ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rotate-180"
            : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <span className="absolute right-16 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap hidden md:block">
              Ask AI
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-r border-t border-gray-100 dark:border-gray-700"></span>
            </span>
            <span className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping duration-[2s]"></span>
            <div className="relative z-10">
              <MessageCircle className="h-7 w-7" />
              {/* Online pulse */}
              <span className="absolute -top-1 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-2 ring-white dark:ring-gray-900" />
              </span>
            </div>
          </>
        )}
      </button>

      {/* ─── Chat Window ─── */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50",
          "w-[400px] max-w-[calc(100vw-48px)] h-[620px] max-h-[calc(100vh-120px)]",
          "rounded-2xl overflow-hidden",
          "flex flex-col",
          "transition-all duration-400 ease-out origin-bottom-right",
          // Glassmorphism
          "bg-white/70 dark:bg-gray-950/80 backdrop-blur-xl",
          "border border-white/30 dark:border-gray-800/60",
          "shadow-2xl shadow-black/10 dark:shadow-black/40",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-8 pointer-events-none"
        )}
      >
        {/* ─── Header ─── */}
        <div className="relative px-5 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Bot className="h-5 w-5" />
              {/* Status dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-950" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[15px] text-gray-900 dark:text-white flex items-center gap-1.5">
                OppsBot
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                AI Career Companion • Online
              </p>
            </div>
          </div>
        </div>

        {/* ─── Messages Area ─── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth overscroll-contain py-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(156,163,175,0.3) transparent",
          }}
        >
          {messages.length === 0 ? (
            /* ─── Empty State ─── */
            <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-5">
              {/* Icon */}
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white fill-white" />
                </div>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  How can I help?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px] mx-auto leading-relaxed">
                  I can find opportunities, suggest scholarships, or give career advice.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="flex flex-col gap-2 w-full max-w-[260px]">
                {SUGGESTED_PROMPTS.map(({ text, icon: Icon }) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className={cn(
                      "flex items-center gap-2.5 text-xs text-left py-2.5 px-3.5 rounded-xl",
                      "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
                      "border border-gray-200/60 dark:border-gray-700/50",
                      "hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800",
                      "text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300",
                      "transition-all duration-200 group"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    <span className="truncate">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ─── Message List ─── */
            <div className="space-y-0.5">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}

          {/* ─── Typing Indicator ─── */}
          {isPending &&
            messages.length > 0 &&
            !messages[messages.length - 1]?.isStreaming && (
              <div className="flex w-full gap-2.5 px-3 py-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* ─── Input Area ─── */}
        <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask OppsBot anything..."
              className={cn(
                "flex-1 rounded-xl border-gray-200/80 dark:border-gray-700/80",
                "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm",
                "focus-visible:ring-blue-500/40 focus-visible:border-blue-400",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "text-sm h-10"
              )}
              disabled={isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isPending}
              className={cn(
                "rounded-xl h-10 w-10 shrink-0 transition-all duration-200",
                "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
                "text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
                "disabled:opacity-40 disabled:shadow-none"
              )}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-[9px] text-gray-400 dark:text-gray-600 text-center mt-1.5 select-none">
            Powered by Gemini • Searches {" "}
            <span className="text-blue-400">Pinecone</span> vector DB
          </p>
        </div>
      </div>
    </>
  );
}
