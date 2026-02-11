"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateRichProfile } from "@/lib/query/user-mutations";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Globe,
  Link,
  ChevronDown,
  ChevronUp,
  Save,
  User,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string[];
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url: string;
  highlights: string[];
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface Language {
  name: string;
  proficiency: string;
}

interface RichProfile {
  headline: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

interface RichProfileFormProps {
  initialData?: Partial<RichProfile>;
}

// =============================================================================
// Collapsible Section
// =============================================================================

function Section({ title, icon: Icon, children, count, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <CardContent className="pt-0 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// =============================================================================
// Main Form Component
// =============================================================================

export function RichProfileForm({ initialData }: RichProfileFormProps) {
  const [profile, setProfile] = useState<RichProfile>({
    headline: initialData?.headline || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    linkedin: initialData?.linkedin || "",
    github: initialData?.github || "",
    summary: initialData?.summary || "",
    education: initialData?.education || [],
    experience: initialData?.experience || [],
    projects: initialData?.projects || [],
    certifications: initialData?.certifications || [],
    languages: initialData?.languages || [],
  });

  const updateMutation = useUpdateRichProfile();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(profile as unknown as Record<string, unknown>);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  // Generic update helper
  const update = <K extends keyof RichProfile>(key: K, value: RichProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const addItem = <T,>(key: keyof RichProfile, item: T) => {
    setProfile(prev => ({ ...prev, [key]: [...(prev[key] as T[]), item] }));
  };

  const removeItem = (key: keyof RichProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [key]: (prev[key] as unknown[]).filter((_, i) => i !== index),
    }));
  };

  const updateItem = <T,>(key: keyof RichProfile, index: number, newItem: T) => {
    setProfile(prev => ({
      ...prev,
      [key]: (prev[key] as T[]).map((item, i) => i === index ? newItem : item),
    }));
  };

  return (
    <div className="space-y-4">
      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Basic Information
          </CardTitle>
          <CardDescription>
            This information helps the AI build better resumes for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Headline / Title</Label>
            <Input value={profile.headline} onChange={e => update("headline", e.target.value)} placeholder="Full-Stack Developer | Tech Enthusiast" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Professional Summary</Label>
            <Textarea value={profile.summary} onChange={e => update("summary", e.target.value)} placeholder="A brief overview of your background, goals, and what makes you unique..." rows={3} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={profile.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 234 567 890" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Website</Label>
              <Input value={profile.website} onChange={e => update("website", e.target.value)} placeholder="https://yoursite.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">LinkedIn URL</Label>
              <Input value={profile.linkedin} onChange={e => update("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">GitHub URL</Label>
              <Input value={profile.github} onChange={e => update("github", e.target.value)} placeholder="https://github.com/..." className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Section title="Work Experience" icon={Briefcase} count={profile.experience.length} defaultOpen={profile.experience.length > 0}>
        {profile.experience.map((exp, i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("experience", i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Position</Label>
                <Input value={exp.position} onChange={e => updateItem("experience", i, { ...exp, position: e.target.value })} className="mt-1" placeholder="Software Engineer" />
              </div>
              <div>
                <Label className="text-xs">Company</Label>
                <Input value={exp.company} onChange={e => updateItem("experience", i, { ...exp, company: e.target.value })} className="mt-1" placeholder="Company Name" />
              </div>
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input value={exp.startDate} onChange={e => updateItem("experience", i, { ...exp, startDate: e.target.value })} className="mt-1" placeholder="2024-01" />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input value={exp.endDate} onChange={e => updateItem("experience", i, { ...exp, endDate: e.target.value })} className="mt-1" placeholder="Present" disabled={exp.current} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={exp.current} onChange={e => updateItem("experience", i, { ...exp, current: e.target.checked, endDate: e.target.checked ? "Present" : exp.endDate })} className="rounded" />
              <Label className="text-xs">Currently working here</Label>
            </div>
            <div className="mt-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={exp.description} onChange={e => updateItem("experience", i, { ...exp, description: e.target.value })} rows={2} className="mt-1" placeholder="What did you do?" />
            </div>
            <div className="mt-2">
              <Label className="text-xs">Highlights (one per line)</Label>
              <Textarea value={exp.highlights.join("\n")} onChange={e => updateItem("experience", i, { ...exp, highlights: e.target.value.split("\n").filter(Boolean) })} rows={2} className="mt-1" placeholder="Key achievements..." />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("experience", { company: "", position: "", startDate: "", endDate: "", current: false, description: "", highlights: [] })}>
          <Plus className="w-3 h-3" /> Add Experience
        </Button>
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap} count={profile.education.length} defaultOpen={profile.education.length > 0}>
        {profile.education.map((edu, i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("education", i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Institution</Label>
                <Input value={edu.institution} onChange={e => updateItem("education", i, { ...edu, institution: e.target.value })} className="mt-1" placeholder="University Name" />
              </div>
              <div>
                <Label className="text-xs">Degree</Label>
                <Input value={edu.degree} onChange={e => updateItem("education", i, { ...edu, degree: e.target.value })} className="mt-1" placeholder="Bachelor's" />
              </div>
              <div>
                <Label className="text-xs">Field of Study</Label>
                <Input value={edu.field} onChange={e => updateItem("education", i, { ...edu, field: e.target.value })} className="mt-1" placeholder="Computer Science" />
              </div>
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input value={edu.startDate} onChange={e => updateItem("education", i, { ...edu, startDate: e.target.value })} className="mt-1" placeholder="2020-09" />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input value={edu.endDate} onChange={e => updateItem("education", i, { ...edu, endDate: e.target.value })} className="mt-1" placeholder="2024-06" />
              </div>
              <div>
                <Label className="text-xs">GPA</Label>
                <Input value={edu.gpa} onChange={e => updateItem("education", i, { ...edu, gpa: e.target.value })} className="mt-1" placeholder="3.8" />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("education", { institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", highlights: [] })}>
          <Plus className="w-3 h-3" /> Add Education
        </Button>
      </Section>

      {/* Projects */}
      <Section title="Projects" icon={Code} count={profile.projects.length} defaultOpen={profile.projects.length > 0}>
        {profile.projects.map((proj, i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700" onClick={() => removeItem("projects", i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Project Name</Label>
                <Input value={proj.name} onChange={e => updateItem("projects", i, { ...proj, name: e.target.value })} className="mt-1" placeholder="Project Name" />
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input value={proj.url} onChange={e => updateItem("projects", i, { ...proj, url: e.target.value })} className="mt-1" placeholder="https://..." />
              </div>
            </div>
            <div className="mt-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={proj.description} onChange={e => updateItem("projects", i, { ...proj, description: e.target.value })} rows={2} className="mt-1" placeholder="Brief description..." />
            </div>
            <div className="mt-2">
              <Label className="text-xs">Technologies (comma-separated)</Label>
              <Input value={proj.technologies.join(", ")} onChange={e => updateItem("projects", i, { ...proj, technologies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="mt-1" placeholder="React, Node.js..." />
            </div>
            <div className="mt-2">
              <Label className="text-xs">Highlights (one per line)</Label>
              <Textarea value={proj.highlights.join("\n")} onChange={e => updateItem("projects", i, { ...proj, highlights: e.target.value.split("\n").filter(Boolean) })} rows={2} className="mt-1" placeholder="Key achievements..." />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("projects", { name: "", description: "", technologies: [], url: "", highlights: [] })}>
          <Plus className="w-3 h-3" /> Add Project
        </Button>
      </Section>

      {/* Certifications */}
      <Section title="Certifications" icon={Award} count={profile.certifications.length}>
        {profile.certifications.map((cert, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={cert.name} onChange={e => updateItem("certifications", i, { ...cert, name: e.target.value })} placeholder="Certification Name" className="flex-1" />
            <Input value={cert.issuer} onChange={e => updateItem("certifications", i, { ...cert, issuer: e.target.value })} placeholder="Issuer" className="flex-1" />
            <Input value={cert.date} onChange={e => updateItem("certifications", i, { ...cert, date: e.target.value })} placeholder="2024-01" className="w-28" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem("certifications", i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("certifications", { name: "", issuer: "", date: "", url: "" })}>
          <Plus className="w-3 h-3" /> Add Certification
        </Button>
      </Section>

      {/* Languages */}
      <Section title="Languages" icon={Globe} count={profile.languages.length}>
        {profile.languages.map((lang, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={lang.name} onChange={e => updateItem("languages", i, { ...lang, name: e.target.value })} placeholder="English" className="flex-1" />
            <Input value={lang.proficiency} onChange={e => updateItem("languages", i, { ...lang, proficiency: e.target.value })} placeholder="Native / Fluent / Intermediate" className="flex-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem("languages", i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => addItem("languages", { name: "", proficiency: "" })}>
          <Plus className="w-3 h-3" /> Add Language
        </Button>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
