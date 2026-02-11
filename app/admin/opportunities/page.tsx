// =============================================================================
// Admin Opportunities List Page
// Lists all opportunities with search, filter, and management actions
// =============================================================================

import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OpportunityActions } from "@/components/admin/opportunity-actions";
import { PublishAllDrafts } from "@/components/admin/publish-all-drafts";

// Pagination helper
const ITEMS_PER_PAGE = 20;

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.q || "";
  const status = params.status || undefined;

  // Build where clause
  const where: any = {};
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") {
    // @ts-ignore
    where.status = status;
  }

  // Fetch data
  const [opportunities, totalCount] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        primaryCategory: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const totalDrafts = await prisma.opportunity.count({ where: { status: "DRAFT" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Opportunities
        </h1>
        <div className="flex items-center gap-3">
          <PublishAllDrafts draftCount={totalDrafts} />
          <Link href="/admin/opportunities/new">
            <Button>Create New</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <form className="flex-1 flex gap-4">
          <input
            name="q"
            placeholder="Search by title or company..."
            defaultValue={query}
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="status"
            defaultValue={status || "ALL"}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button
            type="submit"
            variant="outline"
            className="border-gray-200 dark:border-gray-700"
          >
            Filter
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableHead className="text-gray-500 dark:text-gray-400">
                Title
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                Category
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                Status
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                Views
              </TableHead>
              <TableHead className="text-gray-500 dark:text-gray-400">
                Last Updated
              </TableHead>
              <TableHead className="text-right text-gray-500 dark:text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No opportunities found.
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => (
                <TableRow
                  key={opp.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {opp.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {opp.company}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {opp.primaryCategory}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        opp.status === "ACTIVE"
                          ? "success"
                          : opp.status === "DRAFT"
                            ? "secondary"
                            : opp.status === "EXPIRING_SOON"
                              ? "warning"
                              : "default"
                      }
                    >
                      {opp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {opp.viewCount}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {new Date(opp.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <OpportunityActions id={opp.id} status={opp.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
              results
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}&q=${query}&status=${status || ""}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}&q=${query}&status=${status || ""}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
