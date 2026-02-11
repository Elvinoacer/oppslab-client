"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function BackgroundPattern() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Adjust opacity based on theme for better visibility/subtlety
  const opacity = resolvedTheme === "dark" ? 0.12 : 0.15


  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none h-full w-full">
      {/* 1000 KES Note - Top Left / Center */}
      <div
        className={`absolute top-0 left-0 w-[80vw] md:w-[60vw] h-[80vh] opacity-[var(--bg-opacity)] -translate-x-1/4 -translate-y-1/4 rotate-[15deg] blur-[1px] transition-all duration-700`}
        style={{ "--bg-opacity": opacity } as React.CSSProperties}
      >
        <Image
          src="/images/bg/1000-kes.webp"
          alt="Decorative Background"
          fill
          className="object-contain"
          priority
        />
        {/* Fading gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      </div>

      {/* 100 Dollar Note - Bottom Right / Center */}
      <div
        className={`absolute bottom-0 right-0 w-[80vw] md:w-[60vw] h-[80vh] opacity-[var(--bg-opacity)] translate-x-1/4 translate-y-1/4 -rotate-[15deg] blur-[1px] transition-all duration-700`}
        style={{ "--bg-opacity": opacity } as React.CSSProperties}
      >
        <Image
          src="/images/bg/100-dollar-note.jpg"
          alt="Decorative Background"
          fill
          className="object-contain"
          priority
        />
        {/* Fading gradients */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
      </div>
    </div>
  )
}
