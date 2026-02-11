// =============================================================================
// Design Tokens & Theme Configuration
// =============================================================================

export const colors = {
  // Brand colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  // Accent for CTAs
  accent: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  // Success states
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  // Warning states
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  // Error states
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  // Neutral grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  glow: "0 0 20px rgb(59 130 246 / 0.3)",
} as const;

// Category colors for visual distinction
// Category colors for visual distinction
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  // Employment Types
  INTERNSHIP: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  FULL_TIME: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  PART_TIME: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  CONTRACT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  FREELANCE: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  GIG: { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200" },
  SIDE_HUSTLE: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  TASK: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  VOLUNTEER: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  APPRENTICESHIP: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },

  // Specialized Roles
  TUTORING: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  CONSULTING: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  VIRTUAL_ASSISTANT: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  TRANSCRIPTION: { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
  TRANSLATION: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  COACHING: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  
  // Digital/Commerce
  DROPSHIPPING: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  PRINT_ON_DEMAND: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  DIGITAL_PRODUCT: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  RESELLING: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  HANDMADE: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  CONTENT_MONETIZATION: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  SPONSORSHIP: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  NEWSLETTER: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  COURSE: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  PODCASTING: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  MEMBERSHIP: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  WEBSITE_FLIPPING: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  DOMAIN_FLIPPING: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200" },
  REAL_ESTATE_DIGITAL: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  
  // Financial
  TRADING_CRYPTO: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  TRADING_STOCK: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  INVESTMENT: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  
  // Task/Gig
  USER_TESTING: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  DATA_LABELING: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  BUG_BOUNTY: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  AI_TRAINING: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  MYSTERY_SHOPPING: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  SURVEY: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  
  // Marketing/Growth
  AFFILIATE: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  AMBASSADOR: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  
  // Academic/Funding
  SCHOLARSHIP: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  GRANT: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  FELLOWSHIP: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  RESEARCH: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  COMPETITION: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  PROGRAM: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  
  OTHER: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
};
