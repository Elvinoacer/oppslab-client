import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RealTimeIndicator } from "@/components/ui/real-time-indicator";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { BackgroundPattern } from "@/components/ui/background-pattern";

import { ChatWidget } from "@/components/chat/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "OppsLab - Find Your Next Opportunity",
    template: "%s | OppsLab"
  },
  description: "The smartest way to discover scholarships, internships, grants, and career-launching opportunities. Curated daily, powered by AI.",
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
  keywords: ["scholarships", "grants", "internships", "fellowships", "opportunities", "jobs"],
  openGraph: {
    title: "OppsLab - Find Your Next Opportunity",
    description: "The smartest way to discover scholarships, internships, grants, and career-launching opportunities.",
    url: "https://oppslab.com",
    siteName: "OppsLab",
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "OppsLab - Find Your Next Opportunity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <BackgroundPattern />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <ChatWidget />
              <RealTimeIndicator />
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
