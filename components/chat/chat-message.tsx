
import { cn } from "@/lib/utils";
import { type Message } from "@/hooks/use-chat";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2.5 px-3 py-1.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20"
            : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20"
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative flex max-w-[82%] flex-col rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md shadow-md shadow-blue-500/10"
            : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 rounded-tl-md shadow-sm"
        )}
      >
        <div
          className={cn(
            "prose prose-sm max-w-none break-words",
            isUser
              ? "prose-invert prose-p:text-white prose-strong:text-white prose-li:text-white/90"
              : "dark:prose-invert prose-p:text-gray-800 dark:prose-p:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-white"
          )}
        >
          <ReactMarkdown
            components={{
              a: ({ href, children, ...props }: any) => {
                const isInternal = href?.startsWith("/");
                const linkClassName = cn(
                  "underline decoration-dotted underline-offset-2 transition-colors font-semibold",
                  isUser ? "text-blue-100 hover:text-white" : "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                );
                if (isInternal) {
                  return (
                    <Link href={href || "#"} className={linkClassName}>
                      {children}
                    </Link>
                  );
                }
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    {children}
                  </a>
                );
              },
              p: ({ ...props }: any) => <p {...props} className="mb-1.5 last:mb-0" />,
              ul: ({ ...props }: any) => <ul {...props} className="list-disc pl-4 mb-1.5 last:mb-0 space-y-0.5" />,
              ol: ({ ...props }: any) => <ol {...props} className="list-decimal pl-4 mb-1.5 last:mb-0 space-y-0.5" />,
              li: ({ ...props }: any) => <li {...props} className="text-[13px]" />,
              strong: ({ ...props }: any) => <strong {...props} className="font-semibold" />,
              code: ({ ...props }: any) => (
                <code
                  {...props}
                  className={cn(
                    "px-1 py-0.5 rounded text-xs font-mono",
                    isUser ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                  )}
                />
              ),
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
          {/* Streaming cursor */}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-full align-text-bottom opacity-70" />
          )}
        </div>

        <span
          className={cn(
            "text-[10px] mt-1.5 select-none",
            isUser ? "text-blue-200/70" : "text-gray-400 dark:text-gray-500"
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
