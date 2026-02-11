// =============================================================================
// Create Opportunity Page
// =============================================================================

import { OpportunityForm } from "@/components/admin/opportunity-form";

export default function CreateOpportunityPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create Opportunity</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Add a new opportunity manually or parse from a source.
        </p>
      </div>
      
      <OpportunityForm />
    </div>
  );
}
