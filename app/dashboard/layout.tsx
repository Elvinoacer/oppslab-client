import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = {
  title: "Dashboard | OppsLab",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <DashboardSidebar />
      </div>
      <main className="md:pl-72 min-h-screen bg-gray-50 dark:bg-gray-900/50">
        <DashboardHeader />
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            {children}
        </div>
      </main>
    </div>
  );
}
