// =============================================================================
// Opportunity Form Component
// Used for creating and editing opportunities
// =============================================================================

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateOpportunity, useUpdateOpportunity, useParseMarkdown } from "@/lib/query/hooks"; // Needs update hooks

// Define schema validation
const opportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name is required"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  primaryCategory: z.string().min(1, "Primary category is required"),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRING_SOON", "EXPIRED", "ARCHIVED", "DELETED"]),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  isRemote: z.boolean(),
  deadline: z.string().optional(),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function OpportunityForm({ initialData, isEdit = false }: OpportunityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutateAsync: createOpportunity } = useCreateOpportunity(); 
  const { mutateAsync: updateOpportunity } = useUpdateOpportunity();
  const { mutateAsync: parseMarkdown } = useParseMarkdown();

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: initialData?.title || "",
      company: initialData?.company || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      coverImage: initialData?.coverImage || "",
      primaryCategory: initialData?.primaryCategory || "INTERNSHIP",
      status: initialData?.status || "DRAFT",
      applicationUrl: initialData?.applicationUrl || "",
      isRemote: initialData?.isRemote || false,
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
    },
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    try {
      setLoading(true);
      if (isEdit && initialData?.id) {
        await updateOpportunity({ id: initialData.id, ...data });
        // Trigger revalidation for the updated opportunity
        if (initialData.slug) {
         try {
           fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'super-secret-revalidation-token'}&path=/opportunities/${initialData.slug}`, { method: 'POST' });
         } catch(e) { console.error("Revalidation failed", e); }
        }
      } else {
        await createOpportunity(data);
      }
      router.push("/admin/opportunities");
      router.refresh(); // Or invalidate query
    } catch (error) {
      console.error("Form submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      
      {/* 1. Description / Paste Research Area (Moved to Top) */}
      <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">1. Paste Research / Job Description</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Paste your content below and let AI extract the details for you.
             </p>
          </div>
          <Button 
            type="button" 
            onClick={async () => {
              const text = form.getValues("description");
              if (!text || text.length < 50) {
                alert("Please enter some text/markdown to parse first.");
                return;
              }
              
              try {
                // Trigger parser hook
                const result = await parseMarkdown({ markdown: text });
                
                if (result && result.extractedData) {
                  const data = result.extractedData;
                  // Auto-populate fields
                  form.setValue("title", data.title || form.getValues("title"));
                  form.setValue("company", data.company || form.getValues("company"));
                  form.setValue("shortDescription", data.shortDescription || form.getValues("shortDescription") || "");
                  form.setValue("coverImage", data.coverImage || form.getValues("coverImage") || "");
                  form.setValue("primaryCategory", (data.primaryCategory as any) || "INTERNSHIP");
                  form.setValue("status", "DRAFT");
                  form.setValue("applicationUrl", data.applicationUrl || "");
                  form.setValue("isRemote", data.isRemote || false);
                  form.setValue("deadline", data.deadline ? data.deadline.split('T')[0] : "");
                  
                  // Auto-generate slug if title and company exist
                  if (data.title && data.company) {
                     const slug = `${data.title}-${data.company}`
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                      form.setValue("slug", slug);
                  }

                  alert("AI Extraction Complete! Please review the fields below.");
                }
              } catch (e) {
                console.error(e);
                alert("AI Parsing failed. Check console or try manually.");
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            ✨ Extract Details with AI
          </Button>
        </div>
        
        <textarea
          className="w-full min-h-[300px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          placeholder="# Paste your research or job description here..."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* 2. Review Extracted Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">2. Review & Edit Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
            <Input placeholder="Software Engineering Intern" {...form.register("title")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company *</label>
            <Input placeholder="Tech Corp" {...form.register("company")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
            {form.formState.errors.company && (
              <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug *</label>
            <div className="relative">
              <Input placeholder="software-intern-tech-corp" {...form.register("slug")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
              <button
                type="button"
                className="absolute right-2 top-2 text-xs text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => {
                  const title = form.getValues("title");
                  const company = form.getValues("company");
                  if (title && company) {
                    const slug = `${title}-${company}`
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    form.setValue("slug", slug);
                  }
                }}
              >
                Regenerate
              </button>
            </div>
            {form.formState.errors.slug && (
              <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Category *</label>
            <select 
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...form.register("primaryCategory")}
            >
              <optgroup label="Service-Based (Active Income)">
                <option value="FREELANCE">Freelance / Pro Services</option>
                <option value="CONTRACT">Contract Work</option>
                <option value="TUTORING">Tutoring & Instruction</option>
                <option value="CONSULTING">Consulting & Coaching</option>
                <option value="VIRTUAL_ASSISTANT">Virtual Assistant</option>
                <option value="TRANSCRIPTION">Transcription & Translation</option>
                <option value="GIG">Gig / One-time Job</option>
              </optgroup>

              <optgroup label="Product-Based (E-commerce)">
                <option value="DROPSHIPPING">Dropshipping</option>
                <option value="PRINT_ON_DEMAND">Print on Demand (POD)</option>
                <option value="DIGITAL_PRODUCT">Digital Products (Templates, E-books)</option>
                <option value="RESELLING">Reselling / Flipping Items</option>
                <option value="HANDMADE">Handmade / Crafts</option>
              </optgroup>

              <optgroup label="Content & Media (Passive/Ad-Based)">
                <option value="CONTENT_MONETIZATION">Content Monetization (Ads)</option>
                <option value="SPONSORSHIP">Sponsored Content</option>
                <option value="NEWSLETTER">Paid Newsletter / Membership</option>
                <option value="COURSE">Online Course / Webinar</option>
                <option value="PODCASTING">Podcasting</option>
                <option value="AFFILIATE">Affiliate Marketing</option>
                <option value="AMBASSADOR">Brand Ambassador</option>
              </optgroup>

              <optgroup label="Asset-Based (Strategic)">
                <option value="WEBSITE_FLIPPING">Website / Domain Flipping</option>
                <option value="REAL_ESTATE_DIGITAL">Digital Real Estate / NFT</option>
                <option value="TRADING_STOCK">Stock Trading</option>
                <option value="TRADING_CRYPTO">Crypto Trading</option>
                <option value="INVESTMENT">Investment Opportunity</option>
              </optgroup>

              <optgroup label="Micro-Tasks & Emerging">
                <option value="USER_TESTING">User Testing</option>
                <option value="DATA_LABELING">AI Training / Data Labeling</option>
                <option value="BUG_BOUNTY">Bug Bounty</option>
                <option value="SURVEY">Paid Surveys</option>
                <option value="SIDE_HUSTLE">General Side Hustle</option>
              </optgroup>

              <optgroup label="Employment & Academic">
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full Time Job</option>
                <option value="PART_TIME">Part Time Job</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="GRANT">Grant</option>
                <option value="FELLOWSHIP">Fellowship</option>
                <option value="RESEARCH">Research</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="COMPETITION">Competition</option>
                <option value="PROGRAM">Program / Bootcamp</option>
              </optgroup>

              <option value="OTHER">Other</option>
            </select>
            {form.formState.errors.primaryCategory && (
              <p className="text-sm text-red-500">{form.formState.errors.primaryCategory.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
            <select 
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...form.register("status")}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Application URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Application URL</label>
            <Input placeholder="https://..." {...form.register("applicationUrl")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image URL</label>
            <Input placeholder="https://images.unsplash.com/..." {...form.register("coverImage")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
            <p className="text-xs text-gray-500">Leave blank to use a category-specific default image.</p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <Input type="date" {...form.register("deadline")} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700" />
          </div>

          {/* Remote */}
          <div className="space-y-2 flex items-center gap-2 pt-6">
            <input 
              type="checkbox" 
              id="isRemote"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-600 bg-white dark:bg-gray-800"
              {...form.register("isRemote")} 
            />
            <label htmlFor="isRemote" className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Remote Position?</label>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description (Summary)</label>
          <textarea
            className="w-full h-[100px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder="Brief summary..."
            {...form.register("shortDescription")}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Opportunity" : "Create Opportunity"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          Cancel
        </Button>
      </div>
    </form>
  );
}
