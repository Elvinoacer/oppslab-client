# Opportunity Research Protocol

**OBJECTIVE:** Find and compile a list of **5-10 HIGH-QUALITY** opportunities that match the user's request.
**CRITICAL:** Every opportunity MUST have a **Direct Application Link** and a **Deadline** (if available).

## 1. Search Strategy
Use Google, LinkedIn,upwork and other specialized job boards, and grant databases.
*   **Keywords:** Combine the user's topic with terms like "Apply", "Application",  Deadline not an ealier date past today (e.g. if today is 2026-02-08, then deadline should be 2026-02-09 or later), "Grant", "Fellowship", "Job", "Contract".
*   **Filtering:** Avoid erratic or expired listings(Deadline not an ealier date past today (e.g. if today is 2026-02-08, then deadline should be 2026-02-09 or later)). Verify the application link works.

## 2. Requirement: Structured List
Return the results as a **Structured Markdown List**. For EACH opportunity, provide:

1.  **Title:** (Clear and specific)
2.  **Organization/Company:** (Who is offering it?) if available 
3.  **Category:** (MANDATORY: Pick ONE from this specific list: INTERNSHIP, FULL_TIME, PART_TIME, CONTRACT, FREELANCE, TASK, TUTORING, CONSULTING, VIRTUAL_ASSISTANT, TRANSCRIPTION, TRANSLATION, COACHING, DROPSHIPPING, PRINT_ON_DEMAND, DIGITAL_PRODUCT, RESELLING, HANDMADE, CONTENT_MONETIZATION, SPONSORSHIP, NEWSLETTER, COURSE, PODCASTING, MEMBERSHIP, WEBSITE_FLIPPING, DOMAIN_FLIPPING, REAL_ESTATE_DIGITAL, TRADING_CRYPTO, TRADING_STOCK, INVESTMENT, USER_TESTING, DATA_LABELING, BUG_BOUNTY, AI_TRAINING, MYSTERY_SHOPPING, SCHOLARSHIP, GRANT, FELLOWSHIP, RESEARCH, VOLUNTEER, COMPETITION, PROGRAM, APPRENTICESHIP, GIG, SIDE_HUSTLE, SURVEY, AFFILIATE, AMBASSADOR, OTHER)
4.  **Application URL:** (DIRECT link to apply. Do not link to a generic home page. This is MANDATORY.)
5.  **Deadline:** (YYYY-MM-DD format if possible, or "Rolling")
6.  **Location/Remote:** (City, Country, or "Remote")
7.  **Compensation:** (Salary, Stipend amount, or "Unpaid")
8.  **Requirements:** (List mandatory materials and qualifications: e.g., CV/Resume, Portfolio, Cover Letter, specific degree, or 3+ years experience. Skills are a MUST.)
9.  **Detailed Description:** (A comprehensive summary including the core mission of the role, day-to-day responsibilities, and eligibility criteria. Aim for detail over brevity.) -minimum of 300 words
10. **Image URL:** (DIRECT URL to an image for this opportunity. If a specific image for the opportunity isn't found, find and use the **Company/Organization Logo** URL. Ensure the link is public and ends in an image extension like .jpg, .png or .webp.)

## 3. Example Output Format
(Copy-paste this format for each finding)

***

**Opportunity 1: Senior React Developer**
*   **Company:** TechNova Inc.
*   **Category:** FULL_TIME
*   **URL:** https://technova.com/careers/apply/123
*   **Deadline:** 2026-12-31
*   **Location:** Remote (USA)
*   **Compensation:** $120k - $150k
*   **Requirements:** CV/Resume, GitHub Portfolio, 5+ years React experience, TypeScript mastery.
*   **Detailed Description:** As a Senior React Developer at TechNova, you will lead the architecture of our flagship SaaS platform. Your daily work involves mentoring junior devs, optimizing frontend performance for millions of users, and collaborating with UX designers to implement "pixel-perfect" interfaces using Next.js and Tailwind CSS. We are looking for innovators who want to redefine how businesses handle data visualization.
*   **Image URL:** https://technova.com/logos/main-logo.png

***

**Opportunity 2: Climate Change Research Grant**
*   **Company:** Green Earth Foundation
*   **Category:** GRANT
*   **URL:** https://greenearth.org/grants/climate-2026
*   **Deadline:** 2026-11-15
*   **Location:** Global
*   **Compensation:** $50,000 Grant
*   **Requirements:** Research Proposal (Max 5 pages), Academic CV, PhD in Environmental Science or related field.
*   **Detailed Description:** This grant supports innovative research projects focused on carbon capture and sequestration technologies. The Green Earth Foundation aims to fund scientists who are pushing the boundaries of traditional mitigation strategies. Recipients will be expected to present their findings at our annual summit and publish at least one peer-reviewed article within 18 months of receiving funding. 
*   **Image URL:** https://greenearth.org/images/grants-header.jpg

***
