# Phased Implementation Plan for OppsLab Features

This document outlines the step-by-step implementation for adding Application Tracking, AI Assistance, and Market Insights to OppsLab. Each phase is designed to be executed in a single, focused AI prompt.

## Phase 1: Application Tracking & Success System [COMPLETED]

**Goal**: Allow users to track their applications, remove applied items from the main feed, and monitor their success.

### 1. Database Schema Extensions (`prisma/schema.prisma`)
- **Existing**: `SavedOpportunity` already has `ApplicationStatus` enum (`APPLIED`, `OFFER_RECEIVED`, etc.).
- **Changes Needed**:
    - Ensure `SavedOpportunity` is fully utilized.
    - Add `feedback` field to `SavedOpportunity` for user notes on rejection/success.
    - Add `lastFollowUpAt` to `SavedOpportunity` for the follow-up system.

### 2. API & Data Fetching (Server Actions / API)
- **Update Fetching Logic**:
    - Modify `GET /api/opportunities` (or the server action behind `useOpportunities`) to accept a `excludeApplied: boolean` flag.
    - **Logic**: If user is logged in, exclude opportunities where `SavedOpportunity.status` is `APPLIED` or higher.
- **New Actions**:
    - `markAsApplied(opportunityId)`: Updates/Creates `SavedOpportunity` with status `APPLIED`.
    - `updateApplicationStatus(opportunityId, status)`: For success tracking (e.g., `INTERVIEWING`, `OFFER_RECEIVED`).

### 3. UI Implementation
- **Components**:
    - `ApplicationButton`: Replaces "Save" or sits beside it. "I Applied" -> Optimistic update.
    - `Dashboard/Applications`: A new tab in the user dashboard to view applied opportunities in a Kanban or List view.
- **TanStack Query**:
    - Invalidate `['opportunities']` query when marking as applied to remove it from the list immediately.
    - Create `useMyApplications` hook for the dashboard.

### 4. Success Follow-up System
- **UI**: A simple "Status Check" modal that pops up for applications older than 14 days. "Have you heard back from [Company]?"

---

## Phase 2: AI Companion "OppsBot" [COMPLETED]

**Goal**: An embedded AI chat interface that helps users find opportunities using natural language and their profile context.

### 1. Database & Context
- **Access**: The bot needs read-only access to `Opportunity` (via Pinecone/Vector Search) and `User` (preferences).
- **Schema**: No major changes, maybe `ChatSession` if we want to save history.

### 2. Backend (AI Integration)
- **Tech**: `@google/genai` (Gemini Pro).
- **Tools**:
    - `search_opportunities(query, filters)`: Wraps the existing search logic.
    - `read_opportunity(id)`: Gets full details.
- **Context Construction**: System prompt must include:
    - User's bio and skills (from `User` model).
    - User's saved/applied history (to avoid recommending duplicates).

### 3. UI Implementation
- **Floating Chat Widget**: A persistent chat bubble in the bottom right.
- **Chat Interface**:
    - Standard message list (User/AI).
    - **Custom AI Responses**: Render "Opportunity Cards" directly in the chat when the AI recommends something.
- **TanStack Query**: Use `useMutation` for sending messages to handle loading states and optimistic updates.

---

## Phase 3: Content & Engagement [COMPLETED]

**Goal**: Keep the platform fresh with dynamic facts and a dedicated trends page.

### 1. Database Schema
- **New Model**: `MarketInsight`
    ```prisma
    model MarketInsight {
      id        String   @id @default(cuid())
      type      InsightType // FACT, TREND
      content   String   @db.Text
      source    String?
      validFrom DateTime
      validTo   DateTime
      createdAt DateTime @default(now())
    }
    ```

### 2. Background Jobs (Inngest)
- **Job 1**: `refresh-daily-fact` (Run every 5 hours).
    - Prompt AI: "Generate a surprising or useful statistic about the current [Year] job market for students/freelancers."
    - Save to `MarketInsight`.
- **Job 2**: `analyze-trends` (Daily).
    - Analyze `Opportunity` created in last week. Extract top keywords/skills.
    - Save summary to `MarketInsight`.

### 3. UI Implementation
- **Landing Page**:
    - `HeroFact`: Component to fetch and display the latest `FACT` insight.
- **Trends Page (`/trends`)**:
    - Display AI-generated market analysis.
    - Visualizations (optional): simple bar charts of "Top Skills this Week" (using data from `PlatformStats`).

---

## Phase 4: Personalization Engine [COMPLETED]

**Goal**: Tailor the experience based on user behavior (implicit) and profile (explicit).

### 1. Logic & Algorithm
- **Inputs**: User skills, past searches, viewed categories, applied roles.
- **Output**: A "Match Score" for every opportunity.

### 2. Implementation
- **Backend**:
    - When fetching opportunities, compute a simple Jaccard similarity or overlap score between User Skills and Opportunity Skills.
    - Sort results by `matchScore` descending by default for logged-in users.
- **UI**:
    - "Recommended for You" section on Home.
    - Badges on cards: "95% Match" (based on skill overlap).

---

## Technical Appendix: TanStack Query Pattern

For all fetch requests, follow this pattern:

```typescript
// hooks/use-opportunities.ts
export const useOpportunities = (filters: FilterState) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      const { data } = await axios.get('/api/opportunities', { params: filters });
      return data;
    },
    placeholderData: keepPreviousData, // specific for filtering
  });
};

// hooks/use-mark-applied.ts
export const useMarkApplied = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.post(`/api/opportunities/${id}/apply`),
    onSuccess: () => {
      // Invalidate main list to remove the applied list (if filter is active)
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      // Refetch user dashboard
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    }
  });
};
```
