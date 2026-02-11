import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Tags, 
  Settings,
  Database,
  LogOut
} from "lucide-react";

// Navigation items
const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Opportunities", href: "/admin/opportunities", icon: Briefcase },
  { name: "Drafts", href: "/admin/drafts", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Vector Stats", href: "/admin/vector-stats", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protected route: Require authentication
  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Protected route: Require ADMIN role
  if (session.user?.role !== "ADMIN") {
      // For now, redirect to dashboard if not admin
      redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block fixed h-full z-10 transition-colors duration-300">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              OppsLab Admin
            </span>
          </Link>
        </div>

        <nav className="px-4 py-2 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group transition-colors"
            >
              <item.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-colors duration-300">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            Admin Console
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.email}
            </div>
            {/* User Menu / Logout could go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
