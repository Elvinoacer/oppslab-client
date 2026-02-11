// =============================================================================
// Opportunity Detail Page
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { auth } from "@/auth";
import { SaveButton } from "@/components/opportunities/save-button";
import { ApplicationButton } from "@/components/opportunities/application-button";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

async function getOpportunity(slug: string) {
  const opportunity = await prisma.opportunity.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      eligibilityCriteria: true,
      benefits: true,
      requiredMaterials: true,
      timelineEvents: { orderBy: { eventDate: "asc" } },
      contacts: true,
    },
  });

  if (opportunity) {
    // Increment view count (fire and forget)
    prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  return opportunity;
}

async function getRelatedOpportunities(
  category: string,
  currentId: string,
  country?: string | null
) {
  return prisma.opportunity.findMany({
    where: {
      status: "ACTIVE",
      id: { not: currentId },
      OR: [
        { primaryCategory: category as any },
        { locationCountry: country || undefined },
      ],
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } },
    },
  });
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);

  if (!opportunity) {
    notFound();
  }

  const related = await getRelatedOpportunities(
    opportunity.primaryCategory,
    opportunity.id,
    opportunity.locationCountry
  );

  const location = [opportunity.locationCity, opportunity.locationCountry]
    .filter(Boolean)
    .join(", ");

  const compensation =
    opportunity.compensationMin && opportunity.compensationMax
      ? `${formatCurrency(opportunity.compensationMin.toNumber(), opportunity.compensationCurrency || "USD")} - ${formatCurrency(opportunity.compensationMax.toNumber(), opportunity.compensationCurrency || "USD")}`
      : opportunity.compensationMin
      ? `From ${formatCurrency(opportunity.compensationMin.toNumber(), opportunity.compensationCurrency || "USD")}`
      : null;

  const isExpiringSoon =
    opportunity.deadline &&
    new Date(opportunity.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Check if saved or applied
  const session = await auth();
  let isSaved = false;
  let isApplied = false;
  let savedOpportunityId: string | undefined;

  if (session?.user?.id) {
    const saved = await prisma.savedOpportunity.findFirst({
      where: {
        userId: session.user.id,
        opportunityId: opportunity.id,
      },
      select: { 
        id: true,
        status: true
      },
    });
    
    if (saved) {
      isSaved = true;
      savedOpportunityId = saved.id;
      // Consider applied if status is not SAVED
      isApplied = saved.status !== "SAVED"; 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/opportunities" className="hover:text-blue-600">
                Opportunities
              </Link>
              <span>/</span>
              <span>{opportunity.primaryCategory.replace("_", " ")}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="category" category={opportunity.primaryCategory}>
                {opportunity.primaryCategory.replace("_", " ")}
              </Badge>
              {isExpiringSoon && <Badge variant="warning">Expiring Soon</Badge>}
              {opportunity.isRemote && <Badge variant="info">Remote</Badge>}
            </div>

            {/* Title & Company */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {opportunity.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {opportunity.company}
            </p>

            {/* Key info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 dark:text-gray-400">
              {location && (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {location}
                </span>
              )}
              {opportunity.deadline && (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Deadline: {formatDate(opportunity.deadline)}
                </span>
              )}
              {compensation && (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {compensation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            {/* Description */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About This Opportunity
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {opportunity.description}
                </p>
              </div>
            </section>

            {/* Requirements */}
            {(opportunity.skillsRequired.length > 0 ||
              opportunity.educationRequirements.length > 0) && (
              <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Requirements
                </h2>
                {opportunity.skillsRequired.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skillsRequired.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {opportunity.educationRequirements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                      {opportunity.educationRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Benefits */}
            {opportunity.benefits.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Benefits
                </h2>
                <ul className="space-y-3">
                  {opportunity.benefits.map((benefit) => (
                    <li key={benefit.id} className="flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {benefit.benefitType.replace("_", " ")}
                        </span>
                        {benefit.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {benefit.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Apply card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Ready to Apply?
              </h3>
              {opportunity.deadline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  ⏰ {formatRelativeTime(opportunity.deadline)} left to apply
                </p>
              )}
              {opportunity.applicationUrl && (
                <a
                  href={opportunity.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full mb-3" size="lg">
                    Apply Now
                  </Button>
                </a>
              )}
              
              <div className="flex flex-col gap-2 mt-3">
                <ApplicationButton 
                  opportunityId={opportunity.id} 
                  isApplied={isApplied}
                  className="w-full"
                />
                {!isApplied && (
                  <SaveButton 
                      opportunityId={opportunity.id} 
                      initialIsSaved={isSaved}
                      savedOpportunityId={savedOpportunityId}
                      className="w-full"
                  />
                )}
              </div>

              {/* Resume Builder CTA */}
              {session?.user?.id && (
                <Link href={`/dashboard/resumes?opportunityId=${opportunity.id}&title=${encodeURIComponent(opportunity.title)}&company=${encodeURIComponent(opportunity.company || '')}`}>
                  <Button variant="outline" className="w-full mt-3 gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Build Resume for This Role
                  </Button>
                </Link>
              )}

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              {/* Source */}
              {opportunity.sourcePlatform && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Source: {opportunity.sourcePlatform}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {opportunity.viewCount} views
              </p>
            </div>
          </aside>
        </div>

        {/* Related opportunities */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Opportunities
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp as any} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
