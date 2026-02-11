// =============================================================================
// Resume Query Hooks
// TanStack Query hooks for resume operations
// =============================================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api-client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  url: string;
  highlights: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ResumeLanguage {
  name: string;
  proficiency: string;
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  template: string;
  data: ResumeData;
  opportunityId: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity?: {
    id: string;
    title: string;
    company: string;
    description?: string;
    skillsRequired?: string[];
    experienceLevel?: string;
  } | null;
}

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const resumeQueryKeys = {
  all: ["resumes"] as const,
  list: () => [...resumeQueryKeys.all, "list"] as const,
  detail: (id: string) => [...resumeQueryKeys.all, "detail", id] as const,
};

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Fetch all user resumes
 */
export function useResumes() {
  return useQuery({
    queryKey: resumeQueryKeys.list(),
    queryFn: () => apiGet<Resume[]>("/user/resumes"),
  });
}

/**
 * Fetch a single resume by ID
 */
export function useResume(id: string) {
  return useQuery({
    queryKey: resumeQueryKeys.detail(id),
    queryFn: () => apiGet<Resume>(`/user/resumes/${id}`),
    enabled: !!id,
  });
}

// -----------------------------------------------------------------------------
// Default empty resume data
// -----------------------------------------------------------------------------

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};
