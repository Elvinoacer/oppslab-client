"use client";

import { useMyApplications, useMarkApplied } from "@/lib/query/hooks";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { ApplicationButton } from "@/components/opportunities/application-button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  APPLIED: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Briefcase, label: "Applied" },
  PHONE_SCREEN: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Clock, label: "Phone Screen" },
  INTERVIEWING: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", icon: Clock, label: "Interviewing" },
  ASSESSMENT: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: AlertCircle, label: "Assessment" },
  FINAL_ROUND: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: Clock, label: "Final Round" },
  OFFER_RECEIVED: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2, label: "Offer Received" },
  ACCEPTED: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2, label: "Accepted" },
  REJECTED: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle, label: "Rejected" },
  WITHDRAWN: { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: XCircle, label: "Withdrawn" },
};

export default function ApplicationsPage() {
  const { data: response, isLoading, error } = useMyApplications();
  const applications = response?.data;
  const { mutate: withdraw, isPending: isWithdrawing } = useMarkApplied();

  const handleWithdraw = (id: string) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      withdraw({ id, status: "WITHDRAWN" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load applications. Please try again.</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications yet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Start applying to opportunities to track your progress here.
        </p>
        <Link href="/opportunities">
          <Button>Find Opportunities</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
        <p className="text-gray-500 dark:text-gray-400">Track and manage your applied opportunities</p>
      </div>

      <div className="grid gap-6">
        {applications.map((app) => {
          const config = statusConfig[app.status] || statusConfig.APPLIED;
          const StatusIcon = config.icon;

          return (
            <div 
              key={app.opportunity.id} 
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              {app.status === "WITHDRAWN" && (
                <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500">
                    Withdrawn
                  </div>
                </div>
              )}

              {/* Opportunity Card Preview - Compact */}
              <div className="w-full md:w-80 flex-shrink-0">
                <OpportunityCard opportunity={app.opportunity} variant="compact" />
              </div>

              {/* Application Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                    <span className="text-xs text-gray-400">
                      Applied {formatDate(app.savedAt)}
                    </span>
                  </div>
                  
                  {app.feedback && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{app.feedback}"</p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                     <span>Last updated: {app.statusUpdatedAt ? formatDate(app.statusUpdatedAt) : "N/A"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                   {/* Reusing ApplicationButton for update status */}
                   <ApplicationButton 
                      opportunityId={app.opportunity.id} 
                      className="bg-white border-gray-200 text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700" 
                      variant="outline"
                      size="sm"
                      isApplied={false} // Force button to show so we can update
                   />
                   
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleWithdraw(app.opportunity.id)}
                      disabled={isWithdrawing}
                   >
                     Withdraw
                   </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Basic Pagination */}
      {response?.meta && response.meta.totalPages > 1 && (
         <div className="flex justify-center mt-8 gap-2">
            <Button 
              variant="outline" 
              disabled={!response.meta.hasPrevious}
              onClick={() => { /* TODO: Implement page state */ }}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-500">
              Page {response.meta.page} of {response.meta.totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={!response.meta.hasNext}
              onClick={() => { /* TODO: Implement page state */ }}
            >
              Next
            </Button>
         </div>
      )}
    </div>
  );
}
