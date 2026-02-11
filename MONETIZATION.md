# Monetization Strategy for Opportunity Aggregator (OppsHub)

This document outlines potential revenue streams for the platform, leveraging its core strengths: **AI-powered parsing**, **Semantic Search**, and **Opportunity Aggregation**.

---

## 1. B2C Revenue Models (Candidate-Focused)

The primary user base consists of job seekers, students, and professionals looking for opportunities. Monetization should focus on **enhancing their search efficiency** and **improving application success rates**.

### 1.1 "Pro" Subscription Tier
Offer a monthly/yearly subscription (e.g., $9/mo) unlocking premium features:

*   **⚡ Early Access**: See new opportunities 24-48 hours before free users.
*   **🤖 Unlimited AI Parsing**: While free users might get 3 parses/day, Pro users get unlimited AI parsing of job descriptions to tailor their CVs.
*   **🎯 "Smart Match" Notifications**: Real-time alerts when a job matches their profile with >90% semantic similarity (leveraging Vector Search).
*   **📊 Salary Insights**: Unlock granular salary data distributions for specific roles/locations.
*   **Application Tracking**: Advanced dashboard features to manage applications across multiple statuses.

### 1.2 "Pay-Per-Feature" Capability
Allow free users to purchase high-value actions individually:
*   **AI Resume Tailoring**: $2 per resume optimization for a specific job description.
*   **Cover Letter Generation**: $3 for a custom, AI-generated cover letter based on the parsed opportunity.

---

## 2. B2B Revenue Models (Organization-Focused)

Organizations (companies, universities, non-profits) need qualified candidates. Monetization should focus on **visibility** and **quality of applicants**.

### 2.1 Featured Listings (Sponsored Jobs)
*   **📌 Pinned Posts**: Listings stay at the top of search results for specific keywords or categories.
*   **🎨 Branded Pages**: Enhanced company profile pages with custom branding, videos, and culture sections.
*   **Newsletter Feature**: Inclusion in the "Top Opportunities of the Week" email blast.

### 2.2 Access to Talent (Reverse Search)
*   **Resume Database Access**: Allow recruiters to search for candidates who have opted-in to be visible.
*   **"Smart Sourcer"**: Organizations pay to use the semantic search engine to find candidates matching *their* job description (reverse matching).

### 2.3 API Access (Data Monetization)
*   **Market Intelligence API**: Sell aggregated, anonymized data on hiring trends, salary benchmarks, and demand for specific skills to research firms or other platforms.
*   **Parsing as a Service**: If our AI parsing logic is superior to competitors, offer it as an API for other niche job boards.

---

## 3. Affiliate & Partnership Models

Leverage the user's intent to upskill or qualify for roles.

### 3.1 Education & Certification
*   **Resource Matching**: If a job requires "Python", recommend a specific Coursera/Udemy/Udacity course. Earn affiliate commission on enrollment.
*   **Certification Prep**: Partner with providers for certification exams (AWS, PMP, CPA).

### 3.2 Tool Recommendations
*   **Resume Builders**: Affiliate links to professional resume building tools (e.g., Canva, Novoresume).
*   **Relocation Services**: For users applying to jobs in different cities/countries.

---

## 4. Technical Implementation Roadmap

To support these models, the following technical components would be needed:

### Phase 1: Foundation (3-4 weeks)
*   [ ] **Payment Gateway**: Integrate Stripe or Lemon Squeezy for handling subscriptions and one-time payments.
*   [ ] **User Roles**: Expand `UserRole` enum to support `PRO_USER` and `ORGANIZATION`.
*   [ ] **Access Control**: Implement middleware to gate premium routes/features (`/api/v1/pro/*`).

### Phase 2: B2C Features (4-6 weeks)
*   [ ] **Usage Limits**: Implement Redis-based rate limiting for free tier AI usage.
*   [ ] **Subscription Management**: Webhooks for handling subscription lifecycle (renewals, cancellations).

### Phase 3: B2B Features (6-8 weeks)
*   [ ] **Organization Dashboard**: Separate portal for companies to post/manage jobs and view analytics.
*   [ ] **Sponsored Logic**: Update search algorithms to prioritize `isSponsored` listings while maintaining relevance.

---

## 5. Strategic Recommendation

**Start with B2C "Freemium" + Affiliate.**
1.  Focus on growing the user base by keeping core search free.
2.  Monetize high-intent users via "Pro" features (Early Access + AI Tools).
3.  Simultaneously, add low-friction affiliate links for courses/tools to generate passive revenue without building complex B2B sales pipelines immediately.
