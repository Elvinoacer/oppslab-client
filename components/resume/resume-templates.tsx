"use client";

import type { ResumeData } from "@/lib/query/resume-hooks";

// =============================================================================
// Shared Types
// =============================================================================

interface TemplateProps {
  data: ResumeData;
}

// =============================================================================
// MODERN TEMPLATE — Clean, blue accents, two-column
// =============================================================================

export function ModernTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "10px", lineHeight: 1.5 }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-blue-100 text-[9px]">
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
          {personalInfo.linkedin && <span>in {personalInfo.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>}
          {personalInfo.github && <span>⌨ {personalInfo.github.replace(/https?:\/\/(www\.)?github\.com\//, "")}</span>}
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 px-8 py-5 space-y-4">
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Professional Summary</h2>
              <p className="text-gray-700 text-[9.5px] leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Experience</h2>
              <div className="space-y-3">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-[10.5px] text-gray-900">{exp.position}</h3>
                      <span className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-blue-600 text-[9px] font-medium">{exp.company}</p>
                    {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                    {exp.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-blue-500">{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Projects</h2>
              <div className="space-y-2">
                {projects.map((proj, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-[10px] text-gray-900">{proj.name}</h3>
                      {proj.url && <span className="text-[8px] text-blue-500">{proj.url}</span>}
                    </div>
                    <p className="text-gray-600 text-[9px]">{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.technologies.map((t, j) => (
                          <span key={j} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[7.5px] font-medium">{t}</span>
                        ))}
                      </div>
                    )}
                    {proj.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {proj.highlights.map((h, j) => (
                          <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-blue-500">{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-blue-200 pb-1 mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-[10px] text-gray-900">{edu.degree} in {edu.field}</h3>
                      <span className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">{edu.startDate} — {edu.endDate}</span>
                    </div>
                    <p className="text-blue-600 text-[9px] font-medium">{edu.institution}</p>
                    {edu.gpa && <p className="text-[8.5px] text-gray-500">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[160px] bg-gray-50 px-4 py-5 space-y-4 border-l border-gray-100">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[7.5px] font-medium">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-2">Certifications</h2>
              <div className="space-y-1.5">
                {certifications.map((cert, i) => (
                  <div key={i}>
                    <p className="font-medium text-[8.5px] text-gray-900">{cert.name}</p>
                    <p className="text-[8px] text-gray-500">{cert.issuer} · {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-2">Languages</h2>
              <div className="space-y-1">
                {languages.map((lang, i) => (
                  <div key={i} className="flex justify-between text-[8.5px]">
                    <span className="text-gray-800">{lang.name}</span>
                    <span className="text-gray-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EXECUTIVE TEMPLATE — Formal, serif, dark header
// =============================================================================

export function ExecutiveTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "10px", lineHeight: 1.6 }}>
      {/* Header */}
      <div className="bg-gray-900 text-white px-8 py-6 text-center">
        <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>{personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-gray-300 text-[9px]">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>• LinkedIn</span>}
          {personalInfo.github && <span>• GitHub</span>}
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Professional Summary</h2>
            <p className="text-gray-700 text-[9.5px] italic leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Professional Experience</h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10.5px] text-gray-900">{exp.position}</h3>
                    <span className="text-[8.5px] text-gray-500 italic whitespace-nowrap ml-2">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-gray-600 text-[9px] italic">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Education</h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10px] text-gray-900">{edu.institution}</h3>
                    <span className="text-[8.5px] text-gray-500 italic whitespace-nowrap ml-2">{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <p className="text-gray-600 text-[9px] italic">{edu.degree} in {edu.field}{edu.gpa ? ` — GPA: ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Core Competencies</h2>
            <div className="grid grid-cols-3 gap-1">
              {skills.map((skill, i) => (
                <span key={i} className="text-[9px] text-gray-700 before:content-['■'] before:text-gray-400 before:mr-1">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Notable Projects</h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-bold text-[10px] text-gray-900">{proj.name}</h3>
                  <p className="text-gray-600 text-[9px]">{proj.description}</p>
                  {proj.highlights.length > 0 && (
                    <ul className="mt-0.5 list-disc list-inside">
                      {proj.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-6">
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Certifications</h2>
              {certifications.map((cert, i) => (
                <p key={i} className="text-[9px] text-gray-700">{cert.name} — {cert.issuer} ({cert.date})</p>
              ))}
            </section>
          )}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Languages</h2>
              {languages.map((lang, i) => (
                <p key={i} className="text-[9px] text-gray-700">{lang.name}: {lang.proficiency}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CREATIVE TEMPLATE — Gradient sidebar, bold colors
// =============================================================================

export function CreativeTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg flex" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "10px", lineHeight: 1.5 }}>
      {/* Sidebar */}
      <div className="w-[200px] bg-gradient-to-b from-violet-700 via-purple-700 to-indigo-800 text-white px-5 py-6 space-y-5">
        {/* Avatar placeholder */}
        <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {(personalInfo.fullName || "?").split(" ").map(w => w[0]).join("").substring(0, 2)}
        </div>

        <div className="text-center">
          <h1 className="text-lg font-bold">{personalInfo.fullName || "Your Name"}</h1>
        </div>

        {/* Contact */}
        <section>
          <h2 className="text-[9px] font-bold uppercase tracking-wider text-purple-200 mb-2">Contact</h2>
          <div className="space-y-1.5 text-[8.5px] text-purple-100">
            {personalInfo.email && <p>✉ {personalInfo.email}</p>}
            {personalInfo.phone && <p>☎ {personalInfo.phone}</p>}
            {personalInfo.location && <p>📍 {personalInfo.location}</p>}
            {personalInfo.website && <p>🌐 {personalInfo.website}</p>}
            {personalInfo.linkedin && <p>💼 LinkedIn</p>}
            {personalInfo.github && <p>💻 GitHub</p>}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-wider text-purple-200 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/15 rounded-full text-[7.5px] font-medium text-white">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-wider text-purple-200 mb-2">Languages</h2>
            <div className="space-y-1.5">
              {languages.map((lang, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[8.5px] text-purple-100 mb-0.5">
                    <span>{lang.name}</span>
                    <span>{lang.proficiency}</span>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full">
                    <div className="h-1 bg-white/80 rounded-full" style={{
                      width: lang.proficiency.toLowerCase() === "native" ? "100%" :
                        lang.proficiency.toLowerCase() === "fluent" ? "90%" :
                          lang.proficiency.toLowerCase() === "advanced" ? "75%" :
                            lang.proficiency.toLowerCase() === "intermediate" ? "55%" : "35%"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-wider text-purple-200 mb-2">Certifications</h2>
            <div className="space-y-1.5">
              {certifications.map((cert, i) => (
                <div key={i}>
                  <p className="font-medium text-[8.5px] text-white">{cert.name}</p>
                  <p className="text-[7.5px] text-purple-200">{cert.issuer} · {cert.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 space-y-4">
        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded"></span>
              About Me
            </h2>
            <p className="text-gray-700 text-[9.5px] leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded"></span>
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-violet-200">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-violet-600"></div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10.5px] text-gray-900">{exp.position}</h3>
                    <span className="text-[8px] text-violet-500 font-medium whitespace-nowrap ml-2">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-violet-600 text-[9px] font-semibold">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-violet-500">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded"></span>
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-violet-200">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-violet-600"></div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10px] text-gray-900">{edu.degree} in {edu.field}</h3>
                    <span className="text-[8px] text-violet-500 font-medium whitespace-nowrap ml-2">{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <p className="text-violet-600 text-[9px] font-semibold">{edu.institution}</p>
                  {edu.gpa && <p className="text-[8px] text-gray-500">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded"></span>
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i} className="p-2 bg-violet-50/50 rounded-lg border border-violet-100">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10px] text-gray-900">{proj.name}</h3>
                    {proj.url && <span className="text-[8px] text-violet-500">{proj.url}</span>}
                  </div>
                  <p className="text-gray-600 text-[9px]">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 rounded-full text-[7px] font-semibold">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MINIMAL TEMPLATE — No color, maximum whitespace, content-first
// =============================================================================

export function MinimalTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: "10px", lineHeight: 1.6 }}>
      <div className="px-10 py-8 space-y-5">
        {/* Header */}
        <div className="text-center border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-light tracking-wide text-gray-900">{personalInfo.fullName || "Your Name"}</h1>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[9px] text-gray-500">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.website && <span>• {personalInfo.website}</span>}
            {personalInfo.linkedin && <span>• LinkedIn</span>}
            {personalInfo.github && <span>• GitHub</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <section>
            <p className="text-gray-600 text-[9.5px] leading-relaxed text-center max-w-[500px] mx-auto">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-[10.5px] text-gray-900">{exp.position}</h3>
                    <span className="text-[8.5px] text-gray-400 whitespace-nowrap ml-2">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-gray-500 text-[9px]">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-gray-300">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">Education</h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-medium text-[10px] text-gray-900">{edu.degree} in {edu.field}</h3>
                    <p className="text-gray-500 text-[9px]">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                  </div>
                  <span className="text-[8.5px] text-gray-400 whitespace-nowrap ml-2">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">Skills</h2>
            <p className="text-[9px] text-gray-600">{skills.join(" · ")}</p>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">Projects</h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-medium text-[10px] text-gray-900">{proj.name}</h3>
                  <p className="text-gray-600 text-[9px]">{proj.description}</p>
                  {proj.technologies.length > 0 && <p className="text-[8px] text-gray-400 mt-0.5">{proj.technologies.join(", ")}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom */}
        <div className="grid grid-cols-2 gap-6">
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">Certifications</h2>
              {certifications.map((cert, i) => (
                <p key={i} className="text-[9px] text-gray-600">{cert.name} — {cert.issuer}</p>
              ))}
            </section>
          )}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">Languages</h2>
              {languages.map((lang, i) => (
                <p key={i} className="text-[9px] text-gray-600">{lang.name} — {lang.proficiency}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PROFESSIONAL TEMPLATE — Navy/gold, traditional corporate
// =============================================================================

export function ProfessionalTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "10px", lineHeight: 1.6 }}>
      {/* Header */}
      <div className="bg-[#1a2744] text-white px-8 py-5">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
            <div className="h-0.5 w-16 bg-[#c9a84c] mt-1.5 rounded" />
          </div>
          <div className="text-right text-[8.5px] text-blue-200 space-y-0.5">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.linkedin && <p>LinkedIn</p>}
            {personalInfo.github && <p>GitHub</p>}
          </div>
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {/* Summary */}
        {summary && (
          <section className="border-l-3 border-[#c9a84c] pl-4">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] mb-1">Executive Summary</h2>
            <p className="text-gray-700 text-[9.5px] leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-3">Professional Experience</h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10.5px] text-[#1a2744]">{exp.position}</h3>
                    <span className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-[#c9a84c] text-[9px] font-semibold">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['◆'] before:absolute before:left-0 before:text-[#c9a84c] before:text-[6px] before:top-[2px]">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-3">Education</h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-[10px] text-gray-900">{edu.degree} in {edu.field}</h3>
                    <p className="text-[#c9a84c] text-[9px] font-medium">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                  </div>
                  <span className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">{edu.startDate} — {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-2">Core Competencies</h2>
            <div className="grid grid-cols-3 gap-1">
              {skills.map((skill, i) => (
                <span key={i} className="text-[9px] text-gray-700 before:content-['◆'] before:text-[#c9a84c] before:mr-1 before:text-[6px]">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-3">Key Projects</h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-bold text-[10px] text-gray-900">{proj.name}</h3>
                  <p className="text-gray-600 text-[9px]">{proj.description}</p>
                  {proj.highlights.length > 0 && (
                    <ul className="mt-0.5">
                      {proj.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['◆'] before:absolute before:left-0 before:text-[#c9a84c] before:text-[6px] before:top-[2px]">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-6">
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-2">Certifications</h2>
              {certifications.map((cert, i) => (
                <p key={i} className="text-[9px] text-gray-700">{cert.name} — {cert.issuer} ({cert.date})</p>
              ))}
            </section>
          )}
          {languages.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1a2744] border-b-2 border-[#1a2744] pb-1 mb-2">Languages</h2>
              {languages.map((lang, i) => (
                <p key={i} className="text-[9px] text-gray-700">{lang.name}: {lang.proficiency}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TECHNICAL TEMPLATE — Monospace accents, skills-heavy sidebar
// =============================================================================

export function TechnicalTemplate({ data }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="bg-white text-gray-900 w-full max-w-[210mm] mx-auto shadow-lg flex" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "10px", lineHeight: 1.5 }}>
      {/* Sidebar */}
      <div className="w-[190px] bg-[#0f172a] text-white px-5 py-6 space-y-5">
        {/* Name */}
        <div>
          <h1 className="text-lg font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
          <div className="h-0.5 w-10 bg-emerald-400 mt-1.5 rounded" />
        </div>

        {/* Contact */}
        <section>
          <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>&gt; CONTACT</h2>
          <div className="space-y-1.5 text-[8.5px] text-gray-300">
            {personalInfo.email && <p className="break-all">{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.website && <p className="break-all">{personalInfo.website}</p>}
            {personalInfo.linkedin && <p>LinkedIn</p>}
            {personalInfo.github && <p>GitHub</p>}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>&gt; TECH STACK</h2>
            <div className="space-y-1">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-emerald-400 text-[7px]" style={{ fontFamily: "'Courier New', monospace" }}>▸</span>
                  <span className="text-[8.5px] text-gray-200">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>&gt; LANGUAGES</h2>
            <div className="space-y-1">
              {languages.map((lang, i) => (
                <div key={i} className="flex justify-between text-[8.5px]">
                  <span className="text-gray-200">{lang.name}</span>
                  <span className="text-gray-400" style={{ fontFamily: "'Courier New', monospace" }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>&gt; CERTS</h2>
            <div className="space-y-1.5">
              {certifications.map((cert, i) => (
                <div key={i}>
                  <p className="font-medium text-[8.5px] text-white">{cert.name}</p>
                  <p className="text-[7.5px] text-gray-400">{cert.issuer} · {cert.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 space-y-4">
        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] mb-1.5 flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
              <span className="text-emerald-500">//</span> ABOUT
            </h2>
            <p className="text-gray-700 text-[9.5px] leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] mb-2 flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
              <span className="text-emerald-500">//</span> EXPERIENCE
            </h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-emerald-400 pl-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10.5px] text-gray-900">{exp.position}</h3>
                    <span className="text-[8px] text-gray-400 whitespace-nowrap ml-2" style={{ fontFamily: "'Courier New', monospace" }}>{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-emerald-600 text-[9px] font-semibold">{exp.company}</p>
                  {exp.description && <p className="text-gray-600 text-[9px] mt-0.5">{exp.description}</p>}
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-emerald-500">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] mb-2 flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
              <span className="text-emerald-500">//</span> PROJECTS
            </h2>
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10px] text-gray-900">{proj.name}</h3>
                    {proj.url && <span className="text-[8px] text-emerald-500" style={{ fontFamily: "'Courier New', monospace" }}>{proj.url}</span>}
                  </div>
                  <p className="text-gray-600 text-[9px]">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-[#0f172a] text-emerald-300 rounded text-[7px] font-medium" style={{ fontFamily: "'Courier New', monospace" }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {proj.highlights.length > 0 && (
                    <ul className="mt-1">
                      {proj.highlights.map((h, j) => (
                        <li key={j} className="text-[9px] text-gray-700 pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-emerald-500">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] mb-2 flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
              <span className="text-emerald-500">//</span> EDUCATION
            </h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[10px] text-gray-900">{edu.degree} in {edu.field}</h3>
                    <span className="text-[8px] text-gray-400 whitespace-nowrap ml-2" style={{ fontFamily: "'Courier New', monospace" }}>{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <p className="text-emerald-600 text-[9px] font-medium">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Template Map
// =============================================================================

export const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateProps>> = {
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  technical: TechnicalTemplate,
};

export const TEMPLATE_INFO = [
  { id: "modern", name: "Modern", description: "Clean & minimal with blue accents", color: "from-blue-500 to-indigo-600" },
  { id: "executive", name: "Executive", description: "Formal & authoritative", color: "from-gray-700 to-gray-900" },
  { id: "creative", name: "Creative", description: "Bold gradient sidebar", color: "from-violet-600 to-purple-700" },
  { id: "minimal", name: "Minimal", description: "No color, maximum whitespace", color: "from-gray-300 to-gray-500" },
  { id: "professional", name: "Professional", description: "Navy & gold corporate", color: "from-[#1a2744] to-[#c9a84c]" },
  { id: "technical", name: "Technical", description: "Dark sidebar, monospace accents", color: "from-[#0f172a] to-emerald-500" },
];
