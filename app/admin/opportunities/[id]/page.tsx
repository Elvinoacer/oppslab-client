// =============================================================================
// Edit Opportunity Page
// =============================================================================

import { OpportunityForm } from "@/components/admin/opportunity-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opportunity) {
    notFound();
  }

  // Convert dates and decimals to serializable format if needed
  // Prisma decimals are objects, need to be string or number
  // Dates are Date objects, might need formatting
  const serializedOpportunity = {
    ...opportunity,
    deadline: opportunity.deadline ? opportunity.deadline.toISOString() : null,
    // Add other fields as necessary
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Opportunity</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Update opportunity details and settings.
        </p>
      </div>
      
      <OpportunityForm initialData={serializedOpportunity} isEdit={true} />
    </div>
  );
}
