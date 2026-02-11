import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { OpportunityActions } from "@/components/admin/opportunity-actions";
import { PublishAllDrafts } from "@/components/admin/publish-all-drafts";

export default async function AdminDraftsPage() {
  // Fetch raw drafts (from Draft model)
  const rawDrafts = await prisma.draft.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // Fetch structured drafts (from Opportunity model)
  const structuredDrafts = await prisma.opportunity.findMany({
    where: { status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
    include: {
      curatedBy: {
        select: { name: true, email: true },
      },
    },
  });

  const totalStructuredDrafts = structuredDrafts.length;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Draft Management</h1>
        <div className="flex items-center gap-3">
          <PublishAllDrafts draftCount={totalStructuredDrafts} />
          <Link href="/admin/opportunities/new">
            <Button>Create New</Button>
          </Link>
        </div>
      </div>

      {/* Structured Drafts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Structured Drafts 
            <Badge variant="secondary">{structuredDrafts.length}</Badge>
          </h2>
          <p className="text-sm text-gray-500">Ready to review and publish</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="text-gray-500 dark:text-gray-400">Opportunity</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">Company</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">Curated By</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">Last Updated</TableHead>
                <TableHead className="text-right text-gray-500 dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structuredDrafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No structured drafts found.
                  </TableCell>
                </TableRow>
              ) : (
                structuredDrafts.map((draft) => (
                  <TableRow key={draft.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {draft.title}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {draft.company}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {draft.curatedBy?.name || draft.curatedBy?.email || "System"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <OpportunityActions id={draft.id} status={draft.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Raw Drafts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Raw Drafts 
            <Badge variant="outline">{rawDrafts.length}</Badge>
          </h2>
          <p className="text-sm text-gray-500">Unprocessed data from sources</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <TableHead className="text-gray-500 dark:text-gray-400">Content Preview</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">User</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">Last Updated</TableHead>
                <TableHead className="text-right text-gray-500 dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawDrafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No raw drafts found.
                  </TableCell>
                </TableRow>
              ) : (
                rawDrafts.map((draft) => (
                  <TableRow key={draft.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="max-w-md truncate text-gray-700 dark:text-gray-300 font-medium">
                      {draft.title || draft.content.substring(0, 50) + "..."}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {draft.user.name || draft.user.email}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Resume</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
