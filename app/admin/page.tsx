// =============================================================================
// Admin Dashboard Page
// Overview of platform statistics and quick actions
// =============================================================================

import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatsCard } from "@/components/admin/stats-card"; // Need to create this
import Link from "next/link";
import { inngest } from "@/lib/inngest/client";

export const metadata: Metadata = {
  title: "Admin Dashboard | OppsLab",
};

async function getAdminStats() {
  const [
    totalOpps,
    activeOpps,
    pendingDrafts,
    totalUsers,
    recentOpps
  ] = await Promise.all([
    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { status: "ACTIVE" } }),
    prisma.draft.count(),
    prisma.user.count(),
    prisma.opportunity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true, company: true },
    }),
  ]);

  return {
    totalOpps,
    activeOpps,
    pendingDrafts,
    totalUsers,
    recentOpps,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/opportunities/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 h-10 py-2 px-4 shadow-sm"
          >
            Create Opportunity
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Opportunities</div>
          <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalOpps}</div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Listings</div>
          <div className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">{stats.activeOpps}</div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Drafts</div>
          <div className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">{stats.pendingDrafts}</div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</div>
          <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 ">
        <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-colors">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Recent Opportunities</h3>
          <div className="space-y-4">
            {stats.recentOpps.map((opp) => (
              <div key={opp.id} className="flex item-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium truncate max-w-[200px] text-gray-900 dark:text-white">{opp.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{opp.company}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    opp.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    opp.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {opp.status}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(opp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link href="/admin/opportunities" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              View all opportunities
            </Link>
          </div>
        </div>

        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-colors">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center justify-between group transition-colors text-gray-700 dark:text-gray-300">
              <span>Run Expiration Check</span>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center justify-between group transition-colors text-gray-700 dark:text-gray-300">
              <span>Sync Vector Embeddings</span>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center justify-between group transition-colors text-gray-700 dark:text-gray-300">
              <span>Process Analytics</span>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
