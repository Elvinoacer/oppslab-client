"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, CheckCircle, Save, ArrowLeft } from "lucide-react";
import { useParseBatch, useCreateOpportunity } from "@/lib/query/hooks";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { OpportunityForm } from "@/components/admin/opportunity-form";

// Minimal Opportunity Type for preview
type OpportunityPreview = {
  title: string;
  company: string;
  description: string;
  shortDescription: string;
  primaryCategory: string;
  experienceLevel: string;
  // New fields
  applicationUrl?: string;
  sourceUrl?: string;
  locationCity?: string;
  locationCountry?: string;
  deadline?: string;
  compensationType?: string;
  isRemote: boolean;
  status: "DRAFT" | "ACTIVE";
  // ... other fields
};

export default function BatchImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutateAsync: parseBatch, isPending: isParsing } = useParseBatch();
  const { mutateAsync: createOpportunity, isPending: isSaving } = useCreateOpportunity();

  const [inputText, setInputText] = useState("");
  const [parsedOpportunities, setParsedOpportunities] = useState<OpportunityPreview[]>([]);
  const [activeStep, setActiveStep] = useState<"INPUT" | "REVIEW">("INPUT");

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;

    try {
      const result = await parseBatch({ markdown: inputText });
      if (result?.opportunities && Array.isArray(result.opportunities)) {
        setParsedOpportunities(result.opportunities.map((op: any) => ({
          ...op,
          status: "DRAFT", // Default status
          slug: op.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substr(2, 5)
        })));
        setActiveStep("REVIEW");
        toast({ title: "Success", description: `Parsed ${result.opportunities.length} opportunities.` });
      } else {
        toast({ title: "Error", description: "Could not parse opportunities. Please check the format." });
      }
    } catch (error) {
      console.error("Batch parse failed", error);
      toast({ title: "Error", description: "Failed to parse content." });
    }
  };

  const handleSaveAll = async () => {
    let savedCount = 0;
    let errorCount = 0;

    for (const opportunity of parsedOpportunities) {
      try {
        // Normalize enums to safe values if AI hallucinated
        const safeOp = { ...opportunity };
        
        // Fix Experience Level
        const validExp = ["STUDENT", "ENTRY_LEVEL", "MID_LEVEL", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE", "ANY"];
        if (!validExp.includes(safeOp.experienceLevel)) {
             if (safeOp.experienceLevel === "JUNIOR" || safeOp.experienceLevel === "ENTRY") safeOp.experienceLevel = "ENTRY_LEVEL";
             else if (safeOp.experienceLevel === "MID") safeOp.experienceLevel = "MID_LEVEL";
             else safeOp.experienceLevel = "ANY";
        }

        // Fix Compensation Type
        const validComp = ["SALARY", "HOURLY", "STIPEND", "PRIZE", "EQUITY", "UNPAID", "NEGOTIABLE", "NOT_SPECIFIED"];
        // cast to string to check
        if (safeOp.compensationType && !validComp.includes(safeOp.compensationType as string)) {
            if ((safeOp.compensationType as string) === "PAID") safeOp.compensationType = "NEGOTIABLE";
            else if ((safeOp.compensationType as string) === "GRANT") safeOp.compensationType = "STIPEND"; // Best approximation? Or PRIZE? Or likely Grant should be a Category, not comp type usually.
            else if ((safeOp.compensationType as string) === "VARIABLE") safeOp.compensationType = "NEGOTIABLE";
            else safeOp.compensationType = "NOT_SPECIFIED";
        }

        await createOpportunity(safeOp);
        savedCount++;
      } catch (e) {
        console.error("Failed to save opportunity", opportunity.title, e);
        errorCount++;
      }
    }

    if (savedCount > 0) {
      toast({ title: "Import Complete", description: `Successfully created ${savedCount} opportunities.` });
      router.push("/admin/opportunities");
    }
    
    if (errorCount > 0) {
      toast({ title: "Partial Success", description: `${errorCount} opportunities failed to save.`, variant: "destructive" });
    }
  };

  const updateOpportunity = (index: number, field: string, value: any) => {
    const updated = [...parsedOpportunities];
    updated[index] = { ...updated[index], [field]: value };
    setParsedOpportunities(updated);
  };

  const removeOpportunity = (index: number) => {
    const updated = [...parsedOpportunities];
    updated.splice(index, 1);
    setParsedOpportunities(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/admin/opportunities" className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Batch Import Opportunities</h2>
          <p className="text-muted-foreground">
            Paste research or a list of jobs to create multiple opportunities at once.
          </p>
        </div>
        {activeStep === "REVIEW" && (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveStep("INPUT")}>Restart</Button>
                <Button onClick={handleSaveAll} disabled={isSaving || parsedOpportunities.length === 0}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save {parsedOpportunities.length} Opportunities
                </Button>
            </div>
        )}
      </div>

      {activeStep === "INPUT" && (
        <Card>
          <CardHeader>
            <CardTitle>Paste Content</CardTitle>
            <CardDescription>
              Copy content from your research, a job board, or a document. The AI will extract individual opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="# List of Jobs..."
              className="min-h-[400px] font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button onClick={handleParse} disabled={isParsing || !inputText.trim()} className="w-full">
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Parse Batch
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeStep === "REVIEW" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {parsedOpportunities.map((opportunity, index) => (
              <Card key={index} className="relative group">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="danger" size="icon" type="button" onClick={() => removeOpportunity(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <CardHeader className="pb-2">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>Title</Label>
                            <Input 
                                value={opportunity.title} 
                                onChange={(e) => updateOpportunity(index, "title", e.target.value)}
                                className="font-semibold text-lg"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>Company</Label>
                            <Input 
                                value={opportunity.company} 
                                onChange={(e) => updateOpportunity(index, "company", e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={opportunity.primaryCategory} 
                            onChange={(e) => updateOpportunity(index, "primaryCategory", e.target.value)}
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
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={opportunity.experienceLevel} 
                            onChange={(e) => updateOpportunity(index, "experienceLevel", e.target.value)}
                        >
                            <option value="ANY">Any / Unspecified</option>
                            <option value="STUDENT">Student</option>
                            <option value="ENTRY_LEVEL">Entry Level</option>
                            <option value="MID_LEVEL">Mid Level</option>
                            <option value="SENIOR">Senior</option>
                            <option value="LEAD">Lead</option>
                            <option value="PRINCIPAL">Principal</option>
                            <option value="EXECUTIVE">Executive</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Compensation Type</Label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={opportunity.compensationType || "NOT_SPECIFIED"} 
                            onChange={(e) => updateOpportunity(index, "compensationType", e.target.value)}
                        >
                            <option value="NOT_SPECIFIED">Not Specified</option>
                            <option value="NEGOTIABLE">Negotiable</option>
                            <option value="SALARY">Salary</option>
                            <option value="HOURLY">Hourly</option>
                            <option value="STIPEND">Stipend</option>
                            <option value="PRIZE">Prize</option>
                            <option value="EQUITY">Equity</option>
                            <option value="UNPAID">Unpaid</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Textarea 
                            value={opportunity.shortDescription} 
                            onChange={(e) => updateOpportunity(index, "shortDescription", e.target.value)}
                            className="h-10 min-h-[40px]"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Application URL</Label>
                        <Input 
                            value={opportunity.applicationUrl || ''} 
                            onChange={(e) => updateOpportunity(index, "applicationUrl", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Source URL</Label>
                        <Input 
                            value={opportunity.sourceUrl || ''} 
                            onChange={(e) => updateOpportunity(index, "sourceUrl", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input 
                            value={opportunity.locationCity || ''} 
                            onChange={(e) => updateOpportunity(index, "locationCity", e.target.value)}
                            placeholder="e.g. New York"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Input 
                            value={opportunity.locationCountry || ''} 
                            onChange={(e) => updateOpportunity(index, "locationCountry", e.target.value)}
                            placeholder="e.g. USA"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Input 
                            type="date"
                            value={formatDateForInput(opportunity.deadline)} 
                            onChange={(e) => updateOpportunity(index, "deadline", e.target.value ? new Date(e.target.value).toISOString() : '')}
                        />
                    </div>
                    
                     <div className="flex items-center space-x-2 pt-8">
                        <Checkbox 
                            id={`remote-${index}`} 
                            checked={opportunity.isRemote}
                            onCheckedChange={(checked) => updateOpportunity(index, "isRemote", checked as boolean)}
                        />
                        <Label htmlFor={`remote-${index}`}>Remote Opportunity</Label>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>

           <Button onClick={() => setParsedOpportunities([...parsedOpportunities, {
               title: "New Opportunity",
               company: "Unknown",
               description: "",
               shortDescription: "",
               primaryCategory: "OTHER",
               experienceLevel: "ANY",
               isRemote: false,
               status: "DRAFT",
               applicationUrl: "",
               sourceUrl: "",
               locationCity: "",
               locationCountry: "",
               deadline: ""
           } as OpportunityPreview])} variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Manual Entry
          </Button>
        </div>
      )}
    </div>
  );
}
