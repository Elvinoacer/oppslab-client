"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATE_MAP, TEMPLATE_INFO } from "./resume-templates";
import { useUpdateResume } from "@/lib/query/resume-mutations";
import { useAIGenerateResume } from "@/lib/query/resume-mutations";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  Palette,
} from "lucide-react";
import type { Resume, ResumeData, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification, ResumeLanguage } from "@/lib/query/resume-hooks";

// =============================================================================
// Types
// =============================================================================

interface ResumeEditorProps {
  resume: Resume;
}

// =============================================================================
// Helper Components for Lists
// =============================================================================

function SmartListTextarea({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  className 
}: { 
  value: string[]; 
  onChange: (val: string[]) => void; 
  placeholder?: string; 
  rows?: number; 
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value.join("\n"));

  // Sync from parent only if changed externally (e.g. AI fill)
  // We check if the joined version is different to avoid unnecessary syncs
  useEffect(() => {
    const parentValue = value.join("\n");
    if (parentValue !== localValue) {
      // If the parent value (cleaned or AI generated) is different from local, sync it.
      // But we avoid syncing if it's just a trailing newline or spaces being typed.
      const cleanedLocal = localValue.trim();
      const cleanedParent = parentValue.trim();
      if (cleanedLocal !== cleanedParent) {
          setLocalValue(parentValue);
      }
    }
  }, [value]);

  return (
    <Textarea
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange(e.target.value.split("\n"));
      }}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
}

function SmartInput({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: { 
  value: string[]; 
  onChange: (val: string[]) => void; 
  placeholder?: string; 
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value.join(", "));

  useEffect(() => {
    const parentValue = value.join(", ");
    if (parentValue !== localValue) {
      const cleanedLocal = localValue.split(",").map(s => s.trim()).filter(Boolean).join(", ");
      const cleanedParent = parentValue.split(",").map(s => s.trim()).filter(Boolean).join(", ");
      if (cleanedLocal !== cleanedParent) {
          setLocalValue(parentValue);
      }
    }
  }, [value]);

  return (
    <Input
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange(e.target.value.split(","));
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

// =============================================================================
// Collapsible Section
// =============================================================================

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <Icon className="w-4 h-4 text-blue-600" />
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// =============================================================================
// Main Editor Component
// =============================================================================

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(resume.data);
  const [template, setTemplate] = useState(resume.template);
  const [title, setTitle] = useState(resume.title);
  const [skillsText, setSkillsText] = useState(resume.data.skills.join(", "));
  const updateResume = useUpdateResume();
  const aiGenerate = useAIGenerateResume();
  const printRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to clean resume data before saving or rendering (removes empty strings from arrays)
  const cleanResumeData = useCallback((rawData: ResumeData): ResumeData => {
    const cleaned = JSON.parse(JSON.stringify(rawData)) as ResumeData;
    
    // Clean experience highlights
    cleaned.experience = cleaned.experience.map(exp => ({
      ...exp,
      highlights: exp.highlights.map(h => h.trim()).filter(Boolean)
    }));

    // Clean education highlights
    cleaned.education = cleaned.education.map(edu => ({
      ...edu,
      highlights: edu.highlights ? edu.highlights.map(h => h.trim()).filter(Boolean) : []
    }));

    // Clean project highlights & tech
    cleaned.projects = cleaned.projects.map(proj => ({
      ...proj,
      highlights: proj.highlights.map(h => h.trim()).filter(Boolean),
      technologies: proj.technologies.map(t => t.trim()).filter(Boolean)
    }));

    // Clean skills
    cleaned.skills = cleaned.skills.map(s => s.trim()).filter(Boolean);

    return cleaned;
  }, []);

  // Auto-save with debounce
  const autoSave = useCallback((newData: ResumeData, newTemplate?: string, newTitle?: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // Clean data before sending to API
      const cleanedData = cleanResumeData(newData);
      updateResume.mutate({
        id: resume.id,
        data: cleanedData,
        template: newTemplate || template,
        title: newTitle || title,
      });
    }, 1500);
  }, [resume.id, template, title, updateResume, cleanResumeData]);

  // Update a field and trigger auto-save
  const updateField = useCallback((path: string, value: unknown) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as ResumeData;
      const keys = path.split(".");
      let current: Record<string, unknown> = newData as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key.match(/^\d+$/)) {
          current = (current as unknown as unknown[])[parseInt(key)] as Record<string, unknown>;
        } else {
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = keys[keys.length - 1];
      if (lastKey.match(/^\d+$/)) {
        (current as unknown as unknown[])[parseInt(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }
      autoSave(newData);
      return newData;
    });
  }, [autoSave]);

  // Add item to array
  const addItem = useCallback((path: string, item: unknown) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as ResumeData;
      const keys = path.split(".");
      let current: unknown = newData;
      for (const key of keys) {
        current = (current as Record<string, unknown>)[key];
      }
      (current as unknown[]).push(item);
      autoSave(newData);
      return newData;
    });
  }, [autoSave]);

  // Remove item from array
  const removeItem = useCallback((path: string, index: number) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as ResumeData;
      const keys = path.split(".");
      let current: unknown = newData;
      for (const key of keys) {
        current = (current as Record<string, unknown>)[key];
      }
      (current as unknown[]).splice(index, 1);
      autoSave(newData);
      return newData;
    });
  }, [autoSave]);

  // Handle template change
  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    autoSave(data, newTemplate);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    autoSave(data, undefined, newTitle);
  };

  // Handle AI fill
  const handleAIFill = async () => {
    try {
      const result = await aiGenerate.mutateAsync({
        opportunityId: resume.opportunityId || undefined,
      });

      if (result.needsProfile) {
        toast.error(result.message || "Please fill your profile first", {
          action: {
            label: "Go to Profile",
            onClick: () => window.location.href = "/dashboard/profile",
          },
          duration: 8000,
        });
        return;
      }

      if (result.success && result.data) {
        setData(result.data);
        setSkillsText(result.data.skills.join(", "));
        autoSave(result.data);
        toast.success("Resume filled with AI-generated content!");
      }
    } catch {
      toast.error("Failed to generate resume content. Please try again.");
    }
  };

  // Handle PDF download using html2pdf.js
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownload = async () => {
    if (!printRef.current) {
      toast.error("Preview element not found");
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const element = printRef.current;
      const wrapper = element.parentElement as HTMLElement | null;

      // Save original styles
      const origTransform = wrapper?.style.transform || "";
      const origTransformOrigin = wrapper?.style.transformOrigin || "";
      const origWidth = element.style.width;
      const origMinHeight = element.style.minHeight;

      // Temporarily set A4 print dimensions and remove preview scaling
      if (wrapper) {
        wrapper.style.transform = "none";
        wrapper.style.transformOrigin = "";
      }
      element.style.width = "794px"; // 210mm ≈ 794px at 96 DPI

      // Wait a tick for layout to settle
      await new Promise((r) => setTimeout(r, 100));

      // Capture the element at exact A4 width
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 794,
        canvasWidth: 794,
      });

      // Restore original styles
      if (wrapper) {
        wrapper.style.transform = origTransform;
        wrapper.style.transformOrigin = origTransformOrigin;
      }
      element.style.width = origWidth;
      element.style.minHeight = origMinHeight;

      // Build PDF
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `${(data.personalInfo.fullName || "Resume").replace(/\s+/g, "_")}_${template}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded!");

    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const TemplateComponent = TEMPLATE_MAP[template] || TEMPLATE_MAP.modern;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Editor Panel */}
      <div className="lg:w-[45%] space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
        {/* Header Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="flex-1 text-lg font-semibold min-w-[200px]"
            placeholder="Resume title..."
          />
          <Button onClick={handleAIFill} disabled={aiGenerate.isPending} variant="outline" className="gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-300 hover:border-violet-400 text-violet-700 dark:text-violet-300">
            {aiGenerate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Fill
          </Button>
          <Button onClick={handleDownload} disabled={isGeneratingPDF} variant="outline" className="gap-2">
            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </Button>
        </div>

        {/* Template Gallery */}
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATE_INFO.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateChange(t.id)}
              className={`p-2.5 rounded-lg border-2 transition-all text-left ${
                template === t.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className={`w-full h-8 rounded bg-gradient-to-r ${t.color} mb-1.5`} />
              <p className="text-[11px] font-semibold text-gray-800 dark:text-white leading-tight">{t.name}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Linked Opportunity */}
        {resume.opportunity && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
            <CardContent className="py-2 px-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-gray-500">Tailored for: </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{resume.opportunity.title}</span>
                <span className="text-gray-400"> at </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{resume.opportunity.company}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Info */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Full Name</Label>
              <Input value={data.personalInfo.fullName} onChange={e => updateField("personalInfo.fullName", e.target.value)} placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={data.personalInfo.email} onChange={e => updateField("personalInfo.email", e.target.value)} placeholder="john@example.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={data.personalInfo.phone} onChange={e => updateField("personalInfo.phone", e.target.value)} placeholder="+1 234 567 890" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={data.personalInfo.location} onChange={e => updateField("personalInfo.location", e.target.value)} placeholder="City, Country" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Website</Label>
              <Input value={data.personalInfo.website} onChange={e => updateField("personalInfo.website", e.target.value)} placeholder="https://" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">LinkedIn</Label>
              <Input value={data.personalInfo.linkedin} onChange={e => updateField("personalInfo.linkedin", e.target.value)} placeholder="linkedin.com/in/..." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">GitHub</Label>
              <Input value={data.personalInfo.github} onChange={e => updateField("personalInfo.github", e.target.value)} placeholder="github.com/..." className="mt-1" />
            </div>
          </div>
        </Section>

        {/* Summary */}
        <Section title="Professional Summary" icon={FileText}>
          <Textarea
            value={data.summary}
            onChange={e => updateField("summary", e.target.value)}
            placeholder="A brief 2-3 sentence professional summary..."
            rows={3}
          />
        </Section>

        {/* Experience */}
        <Section title="Work Experience" icon={Briefcase}>
          {data.experience.map((exp, i) => (
            <Card key={i} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("experience", i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <CardContent className="pt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Position</Label>
                    <Input value={exp.position} onChange={e => updateField(`experience.${i}.position`, e.target.value)} placeholder="Software Engineer" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Company</Label>
                    <Input value={exp.company} onChange={e => updateField(`experience.${i}.company`, e.target.value)} placeholder="Company Name" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input value={exp.startDate} onChange={e => updateField(`experience.${i}.startDate`, e.target.value)} placeholder="2024-01" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input value={exp.endDate} onChange={e => updateField(`experience.${i}.endDate`, e.target.value)} placeholder="Present" disabled={exp.current} className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={exp.current} onChange={e => { updateField(`experience.${i}.current`, e.target.checked); if (e.target.checked) updateField(`experience.${i}.endDate`, "Present"); }} className="rounded" />
                  <Label className="text-xs">Currently working here</Label>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea value={exp.description} onChange={e => updateField(`experience.${i}.description`, e.target.value)} placeholder="Brief description..." rows={2} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Key Achievements (one per line)</Label>
                  <SmartListTextarea
                    value={exp.highlights}
                    onChange={val => updateField(`experience.${i}.highlights`, val)}
                    placeholder="Led team of 5 engineers...&#10;Increased performance by 40%..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("experience", { company: "", position: "", startDate: "", endDate: "", current: false, description: "", highlights: [] } as ResumeExperience)}>
            <Plus className="w-3 h-3" /> Add Experience
          </Button>
        </Section>

        {/* Education */}
        <Section title="Education" icon={GraduationCap}>
          {data.education.map((edu, i) => (
            <Card key={i} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("education", i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <CardContent className="pt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label className="text-xs">Institution</Label>
                    <Input value={edu.institution} onChange={e => updateField(`education.${i}.institution`, e.target.value)} placeholder="University Name" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Degree</Label>
                    <Input value={edu.degree} onChange={e => updateField(`education.${i}.degree`, e.target.value)} placeholder="Bachelor's" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Field of Study</Label>
                    <Input value={edu.field} onChange={e => updateField(`education.${i}.field`, e.target.value)} placeholder="Computer Science" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input value={edu.startDate} onChange={e => updateField(`education.${i}.startDate`, e.target.value)} placeholder="2020-09" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input value={edu.endDate} onChange={e => updateField(`education.${i}.endDate`, e.target.value)} placeholder="2024-06" className="mt-1" />
                  </div>
                  <div>
                    <Input value={edu.gpa} onChange={e => updateField(`education.${i}.gpa`, e.target.value)} placeholder="3.8" className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Achievements / Notes (one per line)</Label>
                    <SmartListTextarea 
                      value={edu.highlights || []} 
                      onChange={val => updateField(`education.${i}.highlights`, val)} 
                      placeholder="Dean's List 2023...&#10;Minor in Mathematics..." 
                      className="mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("education", { institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", highlights: [] } as ResumeEducation)}>
            <Plus className="w-3 h-3" /> Add Education
          </Button>
        </Section>

        {/* Skills */}
        <Section title="Skills" icon={Code}>
          <SmartListTextarea
            value={data.skills}
            onChange={val => {
              // We use updateField directly, SmartListTextarea handles local state typing
              updateField("skills", val);
              // Also update the external skillsText state if we still use it for anything
              // Actually, let's remove skillsText state from the main component as it's now redundant
              setSkillsText(val.join(", "));
            }}
            placeholder="JavaScript, TypeScript, React, Node.js, Python..."
            rows={2}
          />
          <p className="text-[10px] text-gray-500">Separate skills by lines or commas (the cleaner will handle it)</p>
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={Code} defaultOpen={false}>
          {data.projects.map((proj, i) => (
            <Card key={i} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("projects", i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <CardContent className="pt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Project Name</Label>
                    <Input value={proj.name} onChange={e => updateField(`projects.${i}.name`, e.target.value)} placeholder="Project Name" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input value={proj.url} onChange={e => updateField(`projects.${i}.url`, e.target.value)} placeholder="https://..." className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea value={proj.description} onChange={e => updateField(`projects.${i}.description`, e.target.value)} placeholder="Brief description..." rows={2} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Technologies (comma-separated)</Label>
                  <SmartInput 
                    value={proj.technologies} 
                    onChange={val => updateField(`projects.${i}.technologies`, val)} 
                    placeholder="React, Node.js..." 
                    className="mt-1" 
                  />
                </div>
                  <div>
                    <Label className="text-xs">Highlights (one per line)</Label>
                    <SmartListTextarea 
                      value={proj.highlights} 
                      onChange={val => updateField(`projects.${i}.highlights`, val)} 
                      placeholder="Key achievement..." 
                      rows={2} 
                      className="mt-1" 
                    />
                  </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("projects", { name: "", description: "", technologies: [], url: "", highlights: [] } as ResumeProject)}>
            <Plus className="w-3 h-3" /> Add Project
          </Button>
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={Award} defaultOpen={false}>
          {data.certifications.map((cert, i) => (
            <Card key={i} className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("certifications", i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <CardContent className="pt-4 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={cert.name} onChange={e => updateField(`certifications.${i}.name`, e.target.value)} placeholder="AWS Certified" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Issuer</Label>
                  <Input value={cert.issuer} onChange={e => updateField(`certifications.${i}.issuer`, e.target.value)} placeholder="Amazon" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input value={cert.date} onChange={e => updateField(`certifications.${i}.date`, e.target.value)} placeholder="2024-01" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input value={cert.url} onChange={e => updateField(`certifications.${i}.url`, e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("certifications", { name: "", issuer: "", date: "", url: "" } as ResumeCertification)}>
            <Plus className="w-3 h-3" /> Add Certification
          </Button>
        </Section>

        {/* Languages */}
        <Section title="Languages" icon={Globe} defaultOpen={false}>
          {data.languages.map((lang, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={lang.name} onChange={e => updateField(`languages.${i}.name`, e.target.value)} placeholder="English" className="flex-1" />
              <Input value={lang.proficiency} onChange={e => updateField(`languages.${i}.proficiency`, e.target.value)} placeholder="Native" className="flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeItem("languages", i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("languages", { name: "", proficiency: "" } as ResumeLanguage)}>
            <Plus className="w-3 h-3" /> Add Language
          </Button>
        </Section>

        {/* Save indicator */}
        <div className="text-center py-2">
          {updateResume.isPending ? (
            <span className="text-xs text-blue-500 flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : (
            <span className="text-xs text-gray-400">Auto-saved</span>
          )}
        </div>
      </div>

      {/* Right: Live Preview Panel */}
      <div className="lg:w-[55%] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Live Preview
          </h3>
          <Button onClick={handleDownload} disabled={isGeneratingPDF} size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            {isGeneratingPDF ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Download PDF
          </Button>
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 overflow-y-auto max-h-[calc(100vh-240px)]">
          <div className="transform origin-top" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
            <div ref={printRef}>
              <TemplateComponent data={cleanResumeData(data)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
