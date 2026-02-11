# AI-Powered Opportunity Aggregator \- Complete System Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)  
2. [System Overview](#system-overview)  
3. [Architecture & Design Philosophy](#architecture--design-philosophy)  
4. [Technology Stack](#technology-stack)  
5. [Database Design](#database-design)  
6. [AI Processing Pipeline](#ai-processing-pipeline)  
7. [Real-time & Caching Strategy](#real-time--caching-strategy)  
8. [Content Management Workflow](#content-management-workflow)  
9. [Search & Discovery System](#search--discovery-system)  
10. [API Design](#api-design)  
11. [Frontend Architecture](#frontend-architecture)  
12. [Deployment Strategy](#deployment-strategy)  
13. [Performance Optimization](#performance-optimization)  
14. [Security Considerations](#security-considerations)  
15. [Monitoring & Analytics](#monitoring--analytics)  
16. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### What This System Does

This platform transforms manually curated opportunity research into a highly structured, searchable, and real-time database. You research opportunities, write them in natural markdown format, paste them into an admin interface, and AI automatically extracts, categorizes, and structures the data. Users then browse through an intelligent, real-time updated interface with advanced filtering and search capabilities.

### Key Differentiators

- **Human Curation**: Quality over quantity \- every opportunity is manually verified  
- **AI Intelligence**: Automatic extraction, categorization, and validation from markdown  
- **Real-time Updates**: Instant cache revalidation when content changes  
- **Deep Categorization**: Multi-dimensional taxonomy for precise discovery  
- **Vector Search**: Semantic search using Pinecone for intelligent matching  
- **Comprehensive Tracking**: Every data point tracked with full audit trails

### Core Workflow

RESEARCH → WRITE MARKDOWN → PASTE IN CMS → AI PROCESSES → REAL-TIME PUBLISH → USERS DISCOVER

---

## System Overview

### The Problem Being Solved

Job seekers, students, and professionals face information overload when searching for opportunities. Legitimate opportunities are buried among scams, outdated listings, and irrelevant results. Existing platforms lack intelligent categorization and real-time freshness.

### The Solution

A curated platform where:

1. **You** manually research and verify opportunities for quality assurance  
2. **AI** handles the tedious work of data extraction and structuring  
3. **Users** get a clean, categorized, searchable interface  
4. **Real-time updates** ensure information is always fresh  
5. **Vector search** enables semantic discovery beyond keyword matching

### System Components

**Admin Side:**

- Markdown paste interface with live preview  
- AI-powered parsing and extraction  
- Review and edit extracted data  
- Bulk import capabilities  
- Content versioning and change tracking

**Public Side:**

- Advanced search with filters  
- Real-time updates via WebSockets  
- Personalized recommendations  
- Saved searches and alerts  
- Mobile-responsive interface

**Background Services:**

- Automated expiration management  
- Cache revalidation triggers  
- Vector embedding generation  
- Analytics processing  
- Email notification system

---

## Architecture & Design Philosophy

### High-Level Architecture

The system follows a modern serverless-first, edge-optimized architecture leveraging Next.js 14+ App Router capabilities.

**Three-Tier Architecture:**

**Tier 1: Edge Layer (Vercel Edge Network)**

- Static page generation with ISR (Incremental Static Regeneration)  
- Edge middleware for authentication  
- Edge caching for frequently accessed data  
- API route handlers at the edge

**Tier 2: Application Layer (Next.js)**

- Server Components for optimal performance  
- Client Components for interactivity  
- Server Actions for mutations  
- API Routes for external integrations  
- Real-time subscriptions via Pusher/Ably

**Tier 3: Data Layer**

- PostgreSQL (Primary Database) \- Relational data  
- Prisma (ORM) \- Type-safe database access  
- Pinecone (Vector Database) \- Semantic search  
- Redis (Optional) \- Session management and rate limiting

### Design Principles

**1\. Real-time First** Every change should propagate to users instantly. When you publish a new opportunity or update a deadline, all connected users see the change without refreshing.

**2\. Type Safety Everywhere** Using TypeScript, Prisma, and Zod for end-to-end type safety from database to UI components.

**3\. Progressive Enhancement** Core functionality works without JavaScript, enhanced features require it.

**4\. Edge-Optimized** Leverage edge computing for global low-latency access.

**5\. AI-Augmented, Not AI-Dependent** AI assists with structuring but humans remain in control of content quality.

**6\. Cache Invalidation Precision** Only revalidate what changed, not everything. Tag-based cache invalidation.

---

## Technology Stack

### Core Framework

**Next.js 14+ (App Router)**

- React Server Components for zero-JS pages where possible  
- Server Actions for form submissions and mutations  
- Built-in API routes  
- Incremental Static Regeneration (ISR)  
- Edge runtime support  
- Image optimization  
- Font optimization

**Why Next.js:**

- Excellent SEO through server-side rendering  
- Built-in routing and API capabilities  
- Vercel deployment integration  
- React ecosystem compatibility  
- Strong TypeScript support  
- Edge network optimization

### AI & LLM Integration

**LangChain.js**

- Orchestration of AI workflows  
- Prompt templates and management  
- Memory management for conversational context  
- Tool integration (function calling)  
- Output parsers for structured data  
- Retry logic and error handling

**Google Gemini (via LangChain)**

- Primary model: Gemini 1.5 Pro for data extraction  
- High accuracy in structured output generation  
- Excellent reasoning for categorization  
- Large context window for long markdown documents

**Why LangChain:**

- Provider-agnostic (easy to switch AI models)  
- Built-in retry and error handling  
- Structured output parsing  
- Conversation memory  
- Tool/function calling abstractions

### Database & ORM

**PostgreSQL 16+**

- Primary relational database  
- Full-text search (pg\_trgm extension)  
- JSON/JSONB support for flexible data  
- Array data types  
- Advanced indexing (GIN, GIST)  
- Transactional integrity  
- Row-level security

**Prisma ORM**

- Type-safe database client  
- Automatic migrations  
- Relation management  
- Connection pooling  
- Query optimization  
- Generated TypeScript types  
- Studio for database inspection

**Why Prisma:**

- Best TypeScript integration  
- Developer experience  
- Automatic type generation  
- Migration management  
- Introspection capabilities  
- Performance optimization

### Vector Database

**Pinecone**

- Vector embeddings storage  
- Semantic similarity search  
- Metadata filtering  
- Namespace organization  
- Scalable to millions of vectors  
- Low-latency queries  
- Hybrid search (vector \+ metadata filters)

**Why Pinecone:**

- Managed service (no ops overhead)  
- Excellent performance  
- Hybrid search capabilities  
- Easy integration with LangChain  
- Generous free tier for starting

### Real-time Infrastructure

**Pusher or Ably**

- WebSocket management  
- Presence channels for online users  
- Private channels for authenticated users  
- Automatic reconnection  
- Message queuing  
- Webhooks for server-side events

**Why Pusher/Ably:**

- Managed WebSocket infrastructure  
- Built-in authentication  
- Channel-based pub/sub  
- Reliable message delivery  
- Dashboard for monitoring

### Caching Strategy

**Next.js Built-in Cache**

- fetch() cache with tags  
- Route segment cache configuration  
- revalidateTag and revalidatePath  
- Time-based revalidation (ISR)

**Optional: Upstash Redis**

- Session storage  
- Rate limiting  
- Temporary data caching  
- Queue management (for background jobs)

### Type Safety & Validation

**TypeScript**

- End-to-end type safety  
- Interface definitions  
- Generic types  
- Type inference

**Zod**

- Runtime validation  
- Schema definition  
- Error handling  
- Type inference from schemas  
- Form validation  
- API input validation

### UI Components

**shadcn/ui**

- Radix UI primitives  
- Tailwind CSS styling  
- Accessible components  
- Customizable  
- Copy-paste architecture

**Tailwind CSS**

- Utility-first styling  
- Responsive design  
- Dark mode support  
- Custom design system

### Background Processing

**Inngest or Trigger.dev**

- Scheduled jobs (cron)  
- Event-driven workflows  
- Retry logic  
- Monitoring dashboard  
- Serverless execution

**Why Inngest/Trigger.dev:**

- No server management  
- Visual workflow builder  
- Built-in observability  
- Free tier available  
- Next.js integration

### Authentication

**NextAuth.js (Auth.js v5)**

- Email/password authentication  
- OAuth providers (Google, GitHub)  
- Session management  
- JWT or database sessions  
- Role-based access control

### Email Service

**Resend or SendGrid**

- Transactional emails  
- Email templates  
- Delivery tracking  
- Bounce handling  
- API-based sending

### Deployment

**Vercel**

- Zero-config Next.js deployment  
- Edge network (CDN)  
- Automatic HTTPS  
- Preview deployments  
- Environment variables management  
- Analytics built-in

**Database Hosting:**

- Neon (PostgreSQL) \- Serverless Postgres with branching  
- Supabase \- Postgres with additional features  
- Railway \- Simple deployment

---

## Database Design

### Design Philosophy

The database is structured to support:

1. **Deep categorization** \- Multiple dimensions of classification  
2. **Comprehensive tracking** \- Every field has metadata  
3. **Flexibility** \- Support for various opportunity types  
4. **Performance** \- Optimized indexes for common queries  
5. **Audit trails** \- Full change history  
6. **Relationships** \- Clean many-to-many associations

### Prisma Schema Overview

The Prisma schema defines all database tables, relationships, and constraints. Here's the conceptual structure:

### Core Tables

#### 1\. Opportunities (Main Table)

This is the central table storing all opportunity information.

**Identity Fields:**

- `id` \- UUID primary key  
- `slug` \- URL-friendly unique identifier (auto-generated from title)  
- `originalMarkdown` \- The raw markdown you pasted (preserved for reference)

**Core Content:**

- `title` \- Opportunity title (required, indexed)  
- `company` \- Organization name  
- `description` \- Full description in HTML (converted from markdown)  
- `shortDescription` \- AI-generated summary (200 chars)

**Multi-dimensional Categorization:**

- `primaryCategory` \- Main type (enum: INTERNSHIP, FULL\_TIME, GRANT, etc.)  
- `industry` \- Industry sector (e.g., TECHNOLOGY, HEALTHCARE)  
- `roleType` \- Specific role (e.g., BACKEND\_ENGINEER, UX\_DESIGNER)  
- `experienceLevel` \- Required experience (enum: STUDENT, ENTRY, MID, SENIOR)  
- `workMode` \- Working arrangement (enum: REMOTE, HYBRID, ONSITE, FLEXIBLE)

**Location:**

- `locationRaw` \- Location as written in markdown  
- `locationCity` \- Extracted city name  
- `locationState` \- State/province  
- `locationCountry` \- Country name (standardized)  
- `locationCoordinates` \- Lat/long for mapping  
- `isRemote` \- Boolean flag

**Temporal Information:**

- `deadline` \- Application deadline (Date)  
- `startDate` \- Position start date (Date)  
- `endDate` \- Position end date (for fixed-term positions)  
- `duration` \- Human-readable duration (e.g., "3 months", "Summer 2026")  
- `isRolling` \- Boolean for rolling admissions

**Compensation:**

- `compensationType` \- Type (enum: SALARY, HOURLY, STIPEND, UNPAID, PRIZE)  
- `compensationMin` \- Minimum amount (Decimal)  
- `compensationMax` \- Maximum amount (Decimal)  
- `compensationCurrency` \- Currency code (default: USD)  
- `compensationPeriod` \- Time period (enum: YEAR, MONTH, HOUR, TOTAL)  
- `compensationRaw` \- Original text preserved

**Requirements:**

- `educationRequirements` \- Array of education needs  
- `skillsRequired` \- Array of required skills  
- `experienceRequired` \- Text description  
- `minimumGPA` \- Decimal value  
- `languageRequirements` \- Array of languages

**Application Details:**

- `applicationUrl` \- Direct application link  
- `applicationEmail` \- Application email  
- `applicationMethod` \- How to apply (enum: URL, EMAIL, BOTH, OTHER)  
- `applicationInstructions` \- Special instructions (HTML)

**Source Tracking:**

- `sourcePlatform` \- Where found (e.g., LINKEDIN, COMPANY\_WEBSITE)  
- `sourceUrl` \- Original listing URL  
- `curatedBy` \- User who added it (relation to User table)

**Status Management:**

- `status` \- Current state (enum: DRAFT, ACTIVE, EXPIRING\_SOON, EXPIRED, FILLED, ARCHIVED)  
- `publishedAt` \- When made public  
- `expiresAt` \- Auto-calculated expiration

**Quality Metrics:**

- `completenessScore` \- 0-100 based on filled fields  
- `aiConfidenceScore` \- AI's confidence in extraction  
- `verificationStatus` \- Manual verification flag

**Engagement Tracking:**

- `viewCount` \- Total views  
- `clickCount` \- Application link clicks  
- `saveCount` \- How many users saved it  
- `lastViewedAt` \- Last view timestamp

**SEO & Search:**

- `metaTitle` \- SEO title  
- `metaDescription` \- SEO description  
- `keywords` \- Array of keywords  
- `searchVector` \- Full-text search vector

**Timestamps:**

- `createdAt` \- Creation timestamp  
- `updatedAt` \- Last update timestamp

**Soft Delete:**

- `deletedAt` \- Null if active, timestamp if deleted

#### 2\. Tags (Many-to-Many with Opportunities)

Flexible tagging system for additional classification.

**Fields:**

- `id` \- UUID  
- `name` \- Tag name (unique)  
- `slug` \- URL-friendly version  
- `category` \- Tag type (SKILL, PROGRAM, BENEFIT, LOCATION, MISC)  
- `description` \- Tag description  
- `usageCount` \- Auto-incremented when used  
- `color` \- Hex color for UI display  
- `icon` \- Optional icon name

**Relations:**

- Many-to-many with Opportunities through OpportunityTags join table

#### 3\. Categories (Hierarchical Tree Structure)

Hierarchical categorization allowing subcategories.

**Fields:**

- `id` \- UUID  
- `name` \- Category name  
- `slug` \- URL-friendly identifier  
- `parentId` \- Self-referencing foreign key for hierarchy  
- `level` \- Tree depth (0 \= root, 1 \= child, etc.)  
- `description` \- Category description  
- `icon` \- Icon name for UI  
- `color` \- Brand color  
- `sortOrder` \- Display order  
- `isActive` \- Enabled/disabled flag  
- `opportunityCount` \- Cached count

**Example Hierarchy:**

Technology (level 0, parentId: null)

├── Software Engineering (level 1, parentId: Technology.id)

│   ├── Backend (level 2\)

│   ├── Frontend (level 2\)

│   └── Full Stack (level 2\)

└── Data Science (level 1\)

    ├── Machine Learning (level 2\)

    └── Analytics (level 2\)

#### 4\. EligibilityCriteria (One-to-Many with Opportunities)

Stores eligibility requirements for each opportunity.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key to Opportunities  
- `criterionType` \- Type (enum: CITIZENSHIP, AGE, ENROLLMENT, LOCATION, GPA, OTHER)  
- `criterionValue` \- Text description of requirement  
- `isRequired` \- Boolean (must meet vs preferred)  
- `description` \- Additional context

**Examples:**

- Type: CITIZENSHIP, Value: "US Citizen or Permanent Resident", Required: true  
- Type: ENROLLMENT, Value: "Currently enrolled in accredited university", Required: true  
- Type: AGE, Value: "18-25 years old", Required: true

#### 5\. Benefits (One-to-Many with Opportunities)

Perks and benefits offered.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key  
- `benefitType` \- Type (enum: HEALTH\_INSURANCE, HOUSING, RELOCATION, MENTORSHIP, EQUIPMENT, PROFESSIONAL\_DEVELOPMENT, OTHER)  
- `description` \- Benefit description  
- `value` \- Monetary value if applicable  
- `isIncluded` \- Boolean (included vs available)

#### 6\. RequiredMaterials (One-to-Many with Opportunities)

Application materials needed.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key  
- `materialType` \- Type (enum: RESUME, COVER\_LETTER, TRANSCRIPT, PORTFOLIO, REFERENCES, WRITING\_SAMPLE, VIDEO\_INTRO, OTHER)  
- `isRequired` \- Boolean (required vs optional)  
- `instructions` \- Specific instructions  
- `format` \- File format (PDF, DOCX, URL, etc.)  
- `maxPages` \- Page limit if applicable  
- `maxSize` \- File size limit in MB

#### 7\. TimelineEvents (One-to-Many with Opportunities)

Important dates and milestones.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key  
- `eventType` \- Type (enum: APPLICATION\_DEADLINE, INTERVIEW\_PERIOD, DECISION\_DATE, START\_DATE, ORIENTATION, OTHER)  
- `eventDate` \- Specific date  
- `eventDateEnd` \- End date for ranges  
- `description` \- Event description  
- `isEstimate` \- Boolean for uncertain dates  
- `notificationEnabled` \- Should users be reminded?

#### 8\. Contacts (One-to-Many with Opportunities)

Contact information for inquiries.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key  
- `contactType` \- Role (enum: RECRUITER, HR, HIRING\_MANAGER, PROGRAM\_COORDINATOR, GENERAL)  
- `name` \- Contact person name  
- `email` \- Email address  
- `phone` \- Phone number  
- `title` \- Job title  
- `linkedinUrl` \- LinkedIn profile  
- `notes` \- Additional notes

#### 9\. OpportunityHistory (Audit Trail)

Tracks all changes to opportunities.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key  
- `changedAt` \- Timestamp  
- `changedBy` \- User who made change  
- `changeType` \- Action (enum: CREATED, UPDATED, STATUS\_CHANGED, PUBLISHED, ARCHIVED, DELETED)  
- `fieldName` \- Which field changed  
- `oldValue` \- Previous value (JSON)  
- `newValue` \- New value (JSON)  
- `fullSnapshot` \- Complete opportunity state at that moment (JSONB)

#### 10\. SavedOpportunities (User Bookmarks)

Users can save opportunities for later.

**Fields:**

- `id` \- UUID  
- `userId` \- Foreign key to User  
- `opportunityId` \- Foreign key to Opportunity  
- `savedAt` \- Timestamp  
- `notes` \- User's personal notes  
- `folderName` \- Optional organization  
- `status` \- User's application status (NOT\_APPLIED, APPLYING, APPLIED, INTERVIEWING, ACCEPTED, REJECTED)

#### 11\. Users (Authentication & Profiles)

User accounts for admin and public users.

**Fields:**

- `id` \- UUID  
- `email` \- Email (unique)  
- `name` \- Full name  
- `role` \- User role (enum: ADMIN, CURATOR, USER)  
- `hashedPassword` \- Encrypted password  
- `emailVerified` \- Verification timestamp  
- `image` \- Profile picture URL  
- `bio` \- Short biography  
- `location` \- User location  
- `preferences` \- User preferences (JSONB)  
- `createdAt` \- Registration timestamp  
- `lastLoginAt` \- Last login timestamp

#### 12\. SearchQueries (Search Analytics)

Tracks user searches for analytics.

**Fields:**

- `id` \- UUID  
- `userId` \- Foreign key (nullable for anonymous)  
- `query` \- Search string  
- `filters` \- Applied filters (JSONB)  
- `resultsCount` \- Number of results  
- `clickedOpportunityId` \- Foreign key to clicked result  
- `searchedAt` \- Timestamp  
- `deviceType` \- MOBILE, TABLET, DESKTOP  
- `userAgent` \- Browser information

#### 13\. VectorEmbeddings (For Pinecone Sync)

Tracks which opportunities have embeddings in Pinecone.

**Fields:**

- `id` \- UUID  
- `opportunityId` \- Foreign key (unique)  
- `pineconeId` \- ID in Pinecone  
- `embeddingModel` \- Model used (e.g., "text-embedding-ada-002")  
- `embeddedAt` \- When created  
- `lastUpdatedAt` \- When last updated  
- `needsUpdate` \- Boolean flag for stale embeddings

### Indexes Strategy

**Primary Indexes:**

- `opportunities.slug` \- Unique index for URL lookups  
- `opportunities.status` \- Filter active opportunities  
- `opportunities.deadline` \- Sort by urgency  
- `opportunities.primaryCategory` \- Category filtering

**Composite Indexes:**

- `(status, deadline)` \- Active opportunities with upcoming deadlines  
- `(primaryCategory, industry, roleType)` \- Multi-dimensional filtering  
- `(locationCountry, locationCity, isRemote)` \- Location-based search

**Full-text Search:**

- GIN index on `searchVector` for PostgreSQL full-text search  
- Trigram index (pg\_trgm) on title and company for fuzzy matching

**Array Indexes:**

- GIN index on `skillsRequired` for array containment queries

### Relationships Summary

**One-to-Many:**

- Opportunity → EligibilityCriteria  
- Opportunity → Benefits  
- Opportunity → RequiredMaterials  
- Opportunity → TimelineEvents  
- Opportunity → Contacts  
- Opportunity → OpportunityHistory  
- User → Opportunities (created)  
- User → SavedOpportunities

**Many-to-Many:**

- Opportunity ↔ Tags (through OpportunityTags)

**Self-Referencing:**

- Category → Category (parent-child hierarchy)

---

## AI Processing Pipeline

### Overview

The AI pipeline transforms unstructured markdown into structured database records. This happens in multiple stages, each with specific responsibilities.

### Stage 1: Markdown Ingestion

**Input:** You paste markdown content into the admin interface along with optional metadata (source URL, platform).

**Processing:**

- Markdown is stored temporarily in browser state  
- Live preview rendered using a markdown parser  
- Character count and basic validation performed  
- Optional: Auto-save to drafts table

**Output:** Markdown string ready for AI processing.

### Stage 2: AI Data Extraction

This is the core intelligence layer using LangChain and Gemini.

**LangChain Chain Structure:**

**Chain 1: Primary Extraction**

- Input: Raw markdown  
- Prompt: Comprehensive extraction prompt (detailed below)  
- Output Parser: Structured JSON with typed fields  
- Temperature: 0 (deterministic)  
- Model: Gemini 1.5 Pro

**The Extraction Prompt:**

The prompt instructs Gemini to extract data into a predefined JSON schema. Key elements:

**Prompt Structure:**

1. Role definition: "You are an expert data extraction specialist"  
2. Task description: Extract structured information from markdown  
3. Schema definition: Exact JSON structure expected  
4. Field descriptions: What each field means  
5. Extraction rules: How to handle ambiguity  
6. Examples: Few-shot examples for edge cases  
7. Output format: JSON only, no markdown code blocks

**Handling Ambiguity:**

The prompt includes specific rules:

- Unknown dates → null  
- "Rolling deadline" → set `isRolling` to true, deadline to null  
- Salary ranges → extract min and max  
- Multiple locations → create as array, flag as multi-location  
- Vague requirements → use best judgment, set confidence score

**Field Mappings:**

The AI is instructed to normalize data:

- Dates: Always YYYY-MM-DD format  
- Categories: Map to predefined enum values  
- Skills: Normalize spelling (e.g., "Javascript" → "JavaScript")  
- Location: Separate city, state, country  
- Compensation: Extract currency, amount, and period separately

**Chain 2: Categorization & Tagging**

After primary extraction, a second chain categorizes the opportunity.

**Input:**

- Extracted data from Chain 1  
- Original markdown for context

**Process:**

- Analyze content semantically  
- Suggest primary category with confidence score  
- Suggest industry based on company/description  
- Suggest role type based on title/responsibilities  
- Generate 8-12 relevant tags  
- Suggest related categories in hierarchy

**Output:**

- `primaryCategory` with confidence (0-100)  
- `industry` with confidence  
- `roleType` with confidence  
- Array of suggested tags with relevance scores  
- Array of related category IDs

**Chain 3: Quality Assessment**

Validates and scores the extraction quality.

**Checks Performed:**

- Completeness: How many fields are filled?  
- Consistency: Do dates make logical sense?  
- Validation: Are email formats valid? URLs accessible?  
- Duplication: Does similar opportunity exist?

**Scoring:**

- Completeness Score: 0-100 based on filled fields  
- AI Confidence Score: AI's own confidence assessment  
- Quality Flags: Array of potential issues

**Chain 4: Enhancement (Optional)**

Enriches the data with additional context.

**Enhancements:**

- Generate short description (200 chars) from full description  
- Generate SEO-optimized meta title and description  
- Suggest related opportunities based on similarity  
- Extract implicit requirements not explicitly stated

### Stage 3: Human Review Interface

Before saving, extracted data is shown for review.

**Review UI Components:**

**Side-by-Side View:**

- Left: Original markdown  
- Right: Extracted structured data

**Editable Fields:** All extracted fields are editable form inputs with:

- Field label  
- Extracted value (pre-filled)  
- AI confidence indicator  
- Edit capability  
- Validation feedback

**Confidence Indicators:**

- Green (90-100%): High confidence  
- Yellow (70-89%): Medium confidence  
- Red (\<70%): Low confidence \- review carefully

**Suggested Actions:**

- Accept all: Trust AI completely  
- Review flagged: Only review low-confidence fields  
- Review all: Manual verification of everything

**Bulk Actions:**

- Accept multiple opportunities at once  
- Queue for later review  
- Discard extraction and re-run

### Stage 4: Database Persistence

Once approved, data is saved to PostgreSQL.

**Transaction Process:**

This happens in a single database transaction to maintain consistency:

1. **Create main opportunity record** in Opportunities table  
2. **Create related records:**  
   - Eligibility criteria (if any)  
   - Benefits (if any)  
   - Required materials (if any)  
   - Timeline events (if any)  
   - Contacts (if any)  
3. **Link existing tags** or create new ones  
4. **Create history record** in OpportunityHistory (type: CREATED)  
5. **Trigger vector embedding generation** (async job)  
6. **Trigger cache revalidation** for affected pages

**Rollback Conditions:** If any step fails, entire transaction rolls back to prevent partial data.

### Stage 5: Vector Embedding Generation

Runs asynchronously after database save.

**Process:**

**Text Preparation:** Combine relevant fields into embedding text:

- Title (weighted 3x)  
- Company (weighted 2x)  
- Description (weighted 1x)  
- Skills required (weighted 2x)  
- Benefits (weighted 1x)

**Embedding Generation:**

- Model: OpenAI text-embedding-3-small or similar  
- Dimensions: 1536  
- Chunk strategy: If text exceeds token limit, split intelligently

**Pinecone Storage:**

- Namespace: "opportunities"  
- ID: Same as database opportunity ID  
- Vector: Generated embedding  
- Metadata: Store searchable fields (category, location, etc.)

**Sync Tracking:** Update VectorEmbeddings table:

- `pineconeId`: Pinecone vector ID  
- `embeddedAt`: Current timestamp  
- `needsUpdate`: Set to false

**Error Handling:** If embedding fails:

- Log error  
- Set `needsUpdate` flag  
- Retry with exponential backoff  
- Alert admin if persistent failure

### Stage 6: Cache Invalidation

Immediately after save, trigger cache revalidation.

**Next.js Revalidation:**

Using tag-based revalidation:

- Revalidate tag: `opportunity-${id}`  
- Revalidate tag: `opportunities-list`  
- Revalidate tag: `category-${primaryCategory}`  
- Revalidate tag: `industry-${industry}`  
- Revalidate path: `/opportunities`  
- Revalidate path: `/opportunities/${slug}`

**Real-time Broadcast:**

Send WebSocket message via Pusher:

- Channel: `opportunities`  
- Event: `opportunity.created`  
- Data: Opportunity ID, title, category

**Connected Clients:** All users browsing the site receive the update and can show a notification: "New opportunity added: \[Title\]"

---

## Real-time & Caching Strategy

### Philosophy

The system balances between:

- **Speed**: Serve cached content for instant loads  
- **Freshness**: Show new content immediately when available  
- **Efficiency**: Don't regenerate unnecessarily

### Next.js Cache Layers

Next.js has multiple cache layers that need coordination:

**1\. Full Route Cache (Static Generation)**

- Entire page HTML cached at build time  
- Revalidated on-demand when content changes  
- Used for: Static opportunity pages, category pages

**2\. Data Cache (fetch requests)**

- Individual fetch() responses cached  
- Tagged for granular invalidation  
- Used for: API calls to database

**3\. Request Memoization**

- Deduplicates requests during single render  
- Automatic within single request lifecycle  
- No configuration needed

**4\. Router Cache (Client-side)**

- Next.js prefetches and caches route segments  
- Invalidated on navigation or revalidation  
- Configurable per-route

### Caching Strategy Per Page Type

#### Homepage (`/`)

**Strategy:** Incremental Static Regeneration (ISR)

**Configuration:**

- Revalidate: 60 seconds (time-based)  
- Tagged with: `homepage`

**Content:**

- Featured opportunities (latest 10\)  
- Category counts  
- Statistics

**Invalidation Triggers:**

- New opportunity published  
- Opportunity status changed to EXPIRED  
- Featured opportunity modified

#### Opportunity List Page (`/opportunities`)

**Strategy:** ISR with tag-based revalidation

**Configuration:**

- Revalidate: 300 seconds (5 minutes)  
- Tagged with: `opportunities-list`, `category-${category}`, `industry-${industry}`

**Dynamic Segments:**

- Filter parameters are client-side (no cache)  
- Base page is cached  
- Search triggers client-side filtering

**Invalidation Triggers:**

- Any opportunity created/updated/deleted  
- Bulk imports completed

#### Individual Opportunity Page (`/opportunities/[slug]`)

**Strategy:** ISR with on-demand revalidation

**Configuration:**

- Revalidate: 86400 seconds (24 hours)  
- Tagged with: `opportunity-${id}`

**Content:**

- Full opportunity details  
- Related opportunities  
- Similar opportunities (vector search)

**Invalidation Triggers:**

- This specific opportunity updated  
- Related opportunities changed significantly

#### Category Pages (`/categories/[category]`)

**Strategy:** ISR with tag-based revalidation

**Configuration:**

- Revalidate: 600 seconds (10 minutes)  
- Tagged with: `category-${category}`

**Invalidation Triggers:**

- New opportunity in this category  
- Opportunity in this category updated/removed

#### Search Results Page (`/search`)

**Strategy:** Server-side rendering (no caching)

**Why no cache:**

- Search queries are highly variable  
- Results personalized based on user  
- Real-time results expected

**Optimization:**

- Database query results cached in Redis (5 minutes)  
- Vector search results cached (10 minutes)  
- Pagination cached per query signature

#### Admin Pages (`/admin/*`)

**Strategy:** No caching

All admin pages are server-rendered on every request for real-time accuracy.

### Real-time Update Mechanisms

#### WebSocket Architecture

**Provider:** Pusher or Ably

**Channels:**

**Public Channels:**

- `opportunities` \- New opportunities, updates, expirations  
- `category-${category}` \- Updates within specific category  
- `location-${country}` \- Location-specific updates

**Private Channels:**

- `user-${userId}` \- Personal notifications  
- `saved-opportunities-${userId}` \- Updates to saved items

**Events:**

**opportunity.created**

{

  id: "uuid",

  title: "Software Engineer Intern",

  category: "INTERNSHIP",

  company: "Google",

  publishedAt: "ISO timestamp"

}

**opportunity.updated**

{

  id: "uuid",

  fields: \["deadline", "compensation"\],

  updatedAt: "ISO timestamp"

}

**opportunity.expired**

{

  id: "uuid",

  title: "...",

  expiredAt: "ISO timestamp"

}

**opportunity.expiring\_soon**

{

  id: "uuid",

  title: "...",

  deadline: "ISO date",

  daysRemaining: 7

}

#### Client-side Real-time Integration

**React Hook for WebSocket:**

Components subscribe to channels and receive live updates.

**State Management:**

When updates arrive:

- Optimistically update UI  
- Fetch full data if needed  
- Show toast notification  
- Update cached data (SWR or React Query)

**Reconnection Handling:**

If connection drops:

- Automatic reconnect attempts  
- Fetch missed updates on reconnect  
- Show "reconnecting..." status

#### Server-triggered Revalidation

When opportunity changes on server:

**Step 1:** Database transaction completes **Step 2:** Trigger cache revalidation via Next.js API

- Call `revalidateTag()` for affected tags  
- Call `revalidatePath()` for affected paths

**Step 3:** Trigger WebSocket broadcast

- Send update event to relevant channels

**Step 4:** Email notifications (if configured)

- Notify users with saved searches matching criteria

### Cache Invalidation Rules

**Precision Invalidation:**

Only invalidate what's truly affected:

**Example: Opportunity deadline updated**

- ❌ Don't invalidate: Entire opportunities list  
- ✅ Do invalidate:  
  - `opportunity-${id}` (this specific page)  
  - `category-${category}` (category list includes this)  
  - `expiring-soon` (if deadline now within 7 days)

**Example: New opportunity created**

- ❌ Don't invalidate: All category pages  
- ✅ Do invalidate:  
  - `opportunities-list`  
  - `category-${primaryCategory}`  
  - `homepage` (if featured)

**Batch Invalidation:**

For bulk operations (e.g., nightly expiration job):

- Collect all affected tags  
- Deduplicate  
- Single revalidation call with array of tags

### Performance Monitoring

**Metrics to Track:**

- Cache hit rate per page type  
- Average page load time  
- Time to interactive (TTI)  
- Real-time message latency  
- Revalidation frequency  
- Database query performance

**Alerting:**

Set alerts for:

- Cache hit rate drops below 85%  
- Page load time exceeds 2 seconds  
- WebSocket connection failures spike  
- Revalidation queue backlog

---

## Content Management Workflow

### Admin User Journey

This section details the complete workflow from finding an opportunity to publishing it.

### Step 1: Research Phase

**Your Process:**

1. **Discover opportunity** on external platform (LinkedIn, company site, etc.)  
2. **Verify legitimacy:**  
   - Check company exists (LinkedIn, website)  
   - Verify email domain matches company  
   - Look for red flags (unrealistic pay, suspicious requirements)  
3. **Gather information:**  
   - Copy all relevant details  
   - Screenshot if helpful  
   - Note source URL  
4. **Decide to curate** if opportunity is legitimate and relevant

### Step 2: Markdown Composition

**Writing the Markdown:**

You write a structured markdown document with all opportunity details.

**Recommended Structure:**

\# \[Opportunity Title\]

\*\*Company:\*\* \[Company Name\]

\*\*Location:\*\* \[City, State/Country or "Remote"\]

\*\*Deadline:\*\* \[Date or "Rolling"\]

\*\*Start Date:\*\* \[Date\]

\*\*Duration:\*\* \[e.g., "3 months", "Full-time permanent"\]

\#\# About the Role

\[Description paragraph\]

\#\# Responsibilities

\- Bullet point 1

\- Bullet point 2

\#\# Requirements

\#\#\# Education

\- Requirement 1

\- Requirement 2

\#\#\# Skills

\- Skill 1

\- Skill 2

\#\#\# Experience

\[Experience description\]

\#\# Compensation

\[Salary/stipend details\]

\#\# Benefits

\- Benefit 1

\- Benefit 2

\#\# How to Apply

\[Application instructions\]

Apply here: \[URL\]

Contact: \[email\]

\#\# Additional Information

\[Any other relevant details\]

\#\# Tags

\#tag1 \#tag2 \#tag3

**Best Practices:**

- Use clear headers for structure  
- Include all available information  
- Use consistent formatting  
- Include exact dates when available  
- Preserve original compensation language  
- Add source URL at bottom

**Time Investment:**

Well-structured markdown takes 5-10 minutes per opportunity but saves time in AI extraction accuracy.

### Step 3: CMS Interface

**Accessing Admin:**

Navigate to `/admin/opportunities/new`

**Authentication:**

Protected by NextAuth \- requires ADMIN or CURATOR role.

**Interface Layout:**

**Left Panel (60% width):**

- Markdown editor with syntax highlighting  
- Live preview below editor  
- Toggle between edit/preview modes  
- Character count  
- Auto-save indicator

**Right Panel (40% width):**

- Quick metadata inputs:  
  - Source platform (dropdown)  
  - Source URL (input)  
  - Priority (optional flag)  
- Action buttons:  
  - "Parse with AI" (primary)  
  - "Save Draft"  
  - "Clear"

**Markdown Editor Features:**

- Syntax highlighting  
- Auto-indent  
- Keyboard shortcuts (Ctrl+B for bold, etc.)  
- Paste image support (uploads to storage)  
- Undo/redo  
- Full-screen mode

**Auto-save:**

Every 30 seconds, draft saved to `DraftsTable` with:

- Content  
- Timestamp  
- User ID  
- Auto-generated ID

**Draft Recovery:**

On page load, check for recent drafts. If found, show prompt: "You have an unsaved draft from \[time ago\]. Restore?"

### Step 4: AI Processing

**Triggering Extraction:**

Click "Parse with AI" button.

**UI Feedback:**

- Button shows loading spinner  
- Progress indicator appears:  
  - "Analyzing markdown..." (2-3 sec)  
  - "Extracting data..." (3-5 sec)  
  - "Categorizing..." (2-3 sec)  
  - "Validating..." (1-2 sec)

Total processing time: 8-13 seconds for complex opportunities.

**Processing Steps (Behind the Scenes):**

1. Send markdown to API route `/api/admin/parse`  
2. API route initializes LangChain pipeline  
3. Primary extraction chain runs  
4. Categorization chain runs  
5. Quality assessment runs  
6. Combined results returned to frontend

**Error Handling:**

If AI processing fails:

- Show error message with details  
- Offer "Retry" button  
- Option to "Edit and Retry"  
- Fallback: Manual entry form

**Success State:**

Extracted data appears in review panel.

### Step 5: Review & Edit

**Review Interface:**

Split view changes:

**Left:** Markdown (read-only now) **Right:** Extracted data in form

**Form Sections:**

**Basic Information:**

- Title (text input)  
- Company (text input with autocomplete)  
- Short description (textarea, 200 char limit)

**Categorization:**

- Primary category (dropdown)  
- Industry (dropdown)  
- Role type (dropdown)  
- Experience level (dropdown)  
- Work mode (dropdown)

Each dropdown shows:

- Selected value  
- AI confidence indicator  
- Option to change

**Location:**

- Location raw (text)  
- City (text)  
- State (text)  
- Country (dropdown)  
- Coordinates (lat/long)  
- Is remote (checkbox)

**Dates:**

- Deadline (date picker)  
- Start date (date picker)  
- End date (date picker, optional)  
- Duration (text)  
- Is rolling (checkbox)

**Compensation:**

- Type (dropdown)  
- Minimum (number)  
- Maximum (number)  
- Currency (dropdown)  
- Period (dropdown)  
- Raw text (preserved, read-only)

**Requirements:**

- Education (array of inputs)  
- Skills (tag input, type to add)  
- Experience text (textarea)  
- Minimum GPA (number)  
- Languages (array of inputs)

**Application:**

- Application URL (text)  
- Application email (email input)  
- Method (dropdown)  
- Instructions (rich text editor)

**Dynamic Sections (Add More):**

- Eligibility criteria (repeatable form)  
- Benefits (repeatable form)  
- Timeline events (repeatable form)  
- Contacts (repeatable form)  
- Required materials (repeatable form)

**Confidence Indicators:**

Each field shows confidence:

- ✓ Green: 90-100%  
- ⚠ Yellow: 70-89%  
- ✗ Red: \<70%

**Validation:**

Real-time validation:

- Required fields marked with \*  
- Invalid formats highlighted  
- Helpful error messages  
- "Fix errors" summary at top if any

**Suggested Tags:**

AI-suggested tags shown as chips:

- Click to accept  
- X to remove  
- Add custom tags

**Preview Button:**

Click to see how opportunity will appear on public site.

### Step 6: Publish or Draft

**Action Buttons:**

**Save as Draft:**

- Status: DRAFT  
- Not visible to public  
- Editable anytime  
- No cache invalidation

**Publish Now:**

- Status: ACTIVE  
- Immediately visible  
- Triggers full pipeline:  
  - Database save  
  - Vector embedding  
  - Cache invalidation  
  - Real-time broadcast

**Schedule Publish:**

- Set future publishedAt timestamp  
- Cron job will publish at scheduled time  
- Status: SCHEDULED

**Publish Confirmation Dialog:**

Before publishing, confirm:

- "Ready to publish \[Title\]?"  
- Preview card of how it will appear  
- Estimated fields completeness: X%  
- "Publish" or "Back to edit"

### Step 7: Post-Publish Actions

**Success Feedback:**

Toast notification: "✓ Opportunity published successfully\!"

**Options:**

- View live page (link to public URL)  
- Share link (copy to clipboard)  
- Add another opportunity  
- Return to dashboard

**Real-time Broadcast:**

WebSocket message sent to all connected users: "New opportunity: \[Title\] at \[Company\]"

Users see non-intrusive notification with option to view.

### Bulk Import Workflow

For importing multiple opportunities at once.

**Interface:**

Navigate to `/admin/opportunities/bulk-import`

**Input Methods:**

**Method 1: Multi-file Upload**

- Upload multiple `.md` files  
- Each file \= one opportunity  
- Batch process all files

**Method 2: Delimited Text**

- Paste multiple opportunities separated by delimiter  
- E.g., `---` or `***` between opportunities

**Method 3: Spreadsheet Import**

- Upload CSV/Excel with structured columns  
- Map columns to database fields  
- AI enhances with descriptions

**Processing:**

1. Parse each item  
2. Run AI extraction in parallel (batch of 5\)  
3. Show progress table:  
   - Title  
   - Status (Processing/Success/Error)  
   - Actions (Review/Retry)  
4. Allow reviewing all before bulk save

**Review Table:**

Each row:

- Checkbox (select/deselect)  
- Title (editable)  
- Category  
- Company  
- Confidence score  
- "Edit" button

**Bulk Actions:**

- Select all  
- Publish selected  
- Save selected as drafts  
- Delete selected

### Edit Existing Opportunity

**Access:**

From admin dashboard, click "Edit" on any opportunity.

**Interface:**

Same as create, but:

- Pre-populated with existing data  
- Shows "Last edited \[time\] by \[user\]"  
- Version history sidebar

**Version History:**

- List of all changes  
- Click to see diff  
- Option to revert to previous version

**Change Detection:**

When editing:

- Changed fields highlighted  
- "Unsaved changes" indicator  
- Prompt if navigating away

**Update Process:**

On save:

1. Create history record with old values  
2. Update database record  
3. Invalidate cache for this opportunity  
4. Trigger re-embedding if content changed  
5. Broadcast update event

**Smart Revalidation:**

Only invalidate what changed:

- Title changed → Invalidate opportunity page, list  
- Deadline changed → Also invalidate expiring-soon pages  
- Category changed → Invalidate old and new category pages

---

## Search & Discovery System

### Multi-layered Search Approach

The platform uses three complementary search methods:

1. **Full-text search** (PostgreSQL) \- Keyword matching  
2. **Vector search** (Pinecone) \- Semantic similarity  
3. **Faceted filtering** (Database indexes) \- Structured filtering

### PostgreSQL Full-text Search

**Implementation:**

Uses `tsvector` for searchable text.

**Indexed Fields:**

- Title (weight A \- highest)  
- Company (weight A)  
- Description (weight B)  
- Skills (weight C)

**Search Features:**

**Fuzzy Matching:** Using pg\_trgm extension for typo tolerance. "gogle" matches "Google"

**Ranking:** Results ranked by relevance score combining:

- Text match score  
- Recency (newer \= higher)  
- Popularity (views/saves)  
- Completeness score

**Boolean Operators:** Support for:

- AND: "engineer AND remote"  
- OR: "internship OR fellowship"  
- NOT: "tech NOT sales"  
- Phrases: "machine learning"

### Pinecone Vector Search

**Purpose:**

Semantic search for concepts, not just keywords.

**Example:** Search: "AI research positions" Matches opportunities mentioning:

- Machine learning  
- Deep learning  
- Neural networks  
- Computer vision

Even if they don't say "AI research".

**Embedding Strategy:**

**Text Preparation:** For each opportunity, create embedding text:

Title: \[title\]

Company: \[company\]

Description: \[description\]

Skills: \[skills joined\]

Benefits: \[benefits joined\]

**Model:** OpenAI text-embedding-3-small (1536 dimensions)

**Metadata:** Store with each vector:

- `id`: Opportunity UUID  
- `category`: Primary category  
- `industry`: Industry  
- `experienceLevel`: Experience level  
- `isRemote`: Boolean  
- `deadline`: ISO date  
- `locationCountry`: Country

**Query Process:**

1. User enters search query  
2. Generate embedding for query  
3. Query Pinecone with:  
   - Vector similarity  
   - Metadata filters  
   - Top 20 results  
4. Fetch full records from PostgreSQL  
5. Merge with full-text search results  
6. Re-rank combined results

**Hybrid Search:**

Combine vector and full-text:

- Vector search finds semantic matches  
- Full-text search finds exact keyword matches  
- Merge and deduplicate  
- Re-rank using weighted formula:  
  - Vector score × 0.6  
  - Full-text score × 0.4

### Faceted Filtering

**Available Filters:**

**Category Filters:**

- Primary category (multi-select)  
- Industry (multi-select)  
- Role type (multi-select)  
- Experience level (multi-select)

**Location Filters:**

- Country (multi-select)  
- City (autocomplete, multi-select)  
- Remote only (checkbox)

**Time Filters:**

- Deadline (date range)  
- Start date (date range)  
- Duration (predefined ranges)

**Compensation Filters:**

- Minimum compensation (slider)  
- Compensation type (multi-select)  
- Currency (multi-select)

**Status Filters:**

- Active only (default)  
- Include expiring soon  
- Include just expired (for archival browsing)

**Skills Filter:**

- Tag input for skills  
- AND logic (has all selected)  
- OR logic (has any selected)

**UI Implementation:**

**Left Sidebar (Desktop):** Filter panel with:

- Collapsible sections  
- Counts per option  
- "Apply filters" button  
- "Clear all" link

**Top Bar (Mobile):**

- "Filters" button opens drawer  
- Active filters shown as removable chips  
- Same filter options in drawer

**Filter Interaction:**

- Real-time count updates as filters change  
- Disabled options that would yield zero results  
- "Applied filters" summary bar  
- Shareable URL with filters as query params

### Smart Search Features

**Autocomplete:**

As user types, show suggestions:

- Previous searches (personal)  
- Popular searches (global)  
- Company names  
- Skills  
- Locations

**Search Intent Detection:**

Detect what user wants:

- "internships in AI" → Auto-select category: Internship, add AI to search  
- "remote jobs paying $100k+" → Auto-check remote, set min compensation  
- "summer 2026" → Set date range filter

**Did You Mean:**

If search yields few results, suggest:

- Similar searches that have results  
- Related categories  
- Broader location (city → state → country)

**Saved Searches:**

Users can save search criteria:

- Name the search  
- Set alert frequency (instant, daily, weekly)  
- Manage from profile

**Search Analytics:**

Track to improve:

- Most common searches  
- Searches with zero results (opportunities to add content)  
- Searches with low click-through (relevance issues)

### Related & Recommended Opportunities

**On Opportunity Page:**

Show related opportunities using:

**Method 1: Same Category \+ Location** SQL query for opportunities with:

- Same primary category  
- Same or nearby location  
- Exclude current opportunity

**Method 2: Vector Similarity** Query Pinecone for similar vectors:

- Exclude current opportunity  
- Top 5 most similar

**Method 3: Collaborative Filtering** "Users who viewed this also viewed..."

- Track view co-occurrence  
- Recommend based on user behavior patterns

**Ranking:** Combine all methods, re-rank by:

- Similarity score  
- Recency  
- Popularity

### Personalization (Future)

**User Profile:**

- Saved preferences (location, categories, skills)  
- Education level  
- Experience level  
- Interests

**Personalized Results:**

- Boost opportunities matching profile  
- Hide already applied/expired  
- Show only relevant categories

**Machine Learning Ranking:**

- Train model on user interactions  
- Features: clicks, saves, applications, time on page  
- Personalized relevance scoring

---

## API Design

### API Architecture

RESTful API with Next.js App Router API routes.

**Base URL:** `/api/v1`

**Authentication:**

- Public endpoints: No auth  
- Admin endpoints: Session-based auth (NextAuth)  
- API keys: For third-party integrations (future)

**Response Format:**

All responses are JSON with consistent structure:

**Success:**

{

  "success": true,

  "data": { ... },

  "meta": {

    "timestamp": "ISO timestamp",

    "requestId": "uuid"

  }

}

**Error:**

{

  "success": false,

  "error": {

    "code": "ERROR\_CODE",

    "message": "Human-readable message",

    "details": { ... }

  },

  "meta": {

    "timestamp": "ISO timestamp",

    "requestId": "uuid"

  }

}

**Pagination:**

{

  "success": true,

  "data": \[ ... \],

  "pagination": {

    "page": 1,

    "pageSize": 20,

    "totalPages": 10,

    "totalCount": 193,

    "hasNext": true,

    "hasPrevious": false

  }

}

### Public API Endpoints

#### GET `/api/v1/opportunities`

List opportunities with filtering and search.

**Query Parameters:**

**Filtering:**

- `category` \- Primary category (enum)  
- `industry` \- Industry (enum)  
- `roleType` \- Role type (enum)  
- `experienceLevel` \- Experience level (enum)  
- `workMode` \- Work mode (enum)  
- `isRemote` \- Boolean  
- `locationCity` \- City name  
- `locationCountry` \- Country code (ISO)  
- `minCompensation` \- Number  
- `tags` \- Comma-separated tags (AND logic)

**Date Filters:**

- `deadlineAfter` \- ISO date  
- `deadlineBefore` \- ISO date  
- `startDateAfter` \- ISO date

**Search:**

- `q` \- Search query (full-text \+ vector)  
- `searchMode` \- "hybrid" | "text" | "semantic"

**Sorting:**

- `sortBy` \- "createdAt" | "deadline" | "title" | "company" | "relevance"  
- `sortOrder` \- "asc" | "desc"

**Pagination:**

- `page` \- Page number (default: 1\)  
- `pageSize` \- Items per page (default: 20, max: 100\)

**Response:**

Array of opportunity objects with:

- Basic fields (id, slug, title, company, etc.)  
- Calculated fields (daysUntilDeadline)  
- Counts (viewCount, saveCount)  
- Excludes: Full description, internal notes

#### GET `/api/v1/opportunities/[slug]`

Get single opportunity by slug.

**Response:**

Full opportunity object including:

- All basic fields  
- Related records (benefits, timeline, etc.)  
- Related opportunities (similar)  
- Recommended opportunities

**Side Effects:**

- Increment viewCount  
- Update lastViewedAt  
- Track in SearchQueries (if from search)

#### GET `/api/v1/categories`

List all categories with hierarchy.

**Response:**

Tree structure:

\[

  {

    "id": "uuid",

    "name": "Technology",

    "slug": "technology",

    "level": 0,

    "children": \[

      {

        "id": "uuid",

        "name": "Software Engineering",

        "slug": "software-engineering",

        "level": 1,

        "children": \[ ... \]

      }

    \],

    "opportunityCount": 123

  }

\]

#### GET `/api/v1/categories/[slug]/opportunities`

Get opportunities within specific category.

**Query Parameters:**

Same as `/opportunities` but category pre-filtered.

#### GET `/api/v1/tags`

List all tags with usage counts.

**Query Parameters:**

- `category` \- Tag category filter  
- `minUsage` \- Minimum usage count  
- `sortBy` \- "name" | "usage"

**Response:**

Array of tag objects.

#### POST `/api/v1/search`

Advanced search with complex queries.

**Request Body:**

{

  "query": "machine learning remote",

  "filters": {

    "categories": \["internship", "full-time"\],

    "locations": \["United States", "Remote"\],

    "compensation": {

      "min": 50000,

      "currency": "USD"

    },

    "deadline": {

      "after": "2026-03-01",

      "before": "2026-06-01"

    }

  },

  "searchMode": "hybrid",

  "page": 1,

  "pageSize": 20

}

**Response:**

Same as GET `/opportunities` but with additional:

- Search metadata (query analysis, suggestions)  
- Highlighted matching text  
- Relevance scores

#### GET `/api/v1/stats`

Platform statistics.

**Response:**

{

  "totalActive": 1234,

  "expiringSoon": 56,

  "totalCategories": 15,

  "totalCompanies": 432,

  "recentlyAdded": 23,

  "topCategories": \[

    { "category": "internship", "count": 345 },

    ...

  \],

  "topIndustries": \[ ... \],

  "topLocations": \[ ... \]

}

### Admin API Endpoints

All require authentication.

#### POST `/api/v1/admin/parse`

Parse markdown into structured data.

**Request:**

{

  "markdown": "\# Title\\n\\n...",

  "sourcePlatform": "linkedin",

  "sourceUrl": "https://..."

}

**Response:**

{

  "extractedData": { ... },

  "suggestions": {

    "tags": \[ ... \],

    "relatedCategories": \[ ... \]

  },

  "quality": {

    "completenessScore": 85,

    "aiConfidence": 92,

    "flags": \[ ... \]

  }

}

#### POST `/api/v1/admin/opportunities`

Create new opportunity.

**Request:**

Full opportunity object.

**Response:**

Created opportunity with ID.

#### PUT `/api/v1/admin/opportunities/[id]`

Update existing opportunity.

**Request:**

Partial opportunity object (only changed fields).

**Response:**

Updated opportunity.

#### DELETE `/api/v1/admin/opportunities/[id]`

Soft delete (set deletedAt).

#### POST `/api/v1/admin/opportunities/bulk`

Bulk import opportunities.

**Request:**

{

  "opportunities": \[ ... \],

  "publishImmediately": false

}

**Response:**

{

  "total": 10,

  "successful": 8,

  "failed": 2,

  "results": \[

    { "index": 0, "status": "success", "id": "uuid" },

    { "index": 5, "status": "error", "error": "..." },

    ...

  \]

}

#### POST `/api/v1/admin/revalidate`

Manually trigger cache revalidation.

**Request:**

{

  "type": "tag" | "path",

  "values": \["opportunity-123", "opportunities-list"\]

}

### Webhooks (Future)

Allow external systems to receive events.

**Events:**

- `opportunity.created`  
- `opportunity.updated`  
- `opportunity.expired`  
- `opportunity.deleted`

**Payload:**

Opportunity data \+ metadata.

### Rate Limiting

**Public Endpoints:**

- 100 requests/minute per IP  
- 1000 requests/hour per IP

**Admin Endpoints:**

- 500 requests/minute per user  
- No hourly limit

**Implementation:**

Using Upstash Redis for distributed rate limiting.

**Response Headers:**

- `X-RateLimit-Limit`: Total allowed  
- `X-RateLimit-Remaining`: Remaining in window  
- `X-RateLimit-Reset`: Unix timestamp of reset

**429 Response:**

{

  "error": {

    "code": "RATE\_LIMIT\_EXCEEDED",

    "message": "Too many requests",

    "retryAfter": 60

  }

}

### API Versioning

Current version: v1

**Strategy:** URL-based versioning (`/api/v1`, `/api/v2`)

**Deprecation Policy:**

- 6 months notice before deprecation  
- Version supported for 1 year after new version  
- Deprecation warnings in response headers

---

## Frontend Architecture

### Component Structure

Next.js App Router with React Server Components.

**Directory Structure:**

app/

├── (public)/                 \# Public-facing pages

│   ├── page.tsx             \# Homepage

│   ├── opportunities/       

│   │   ├── page.tsx         \# List page

│   │   └── \[slug\]/

│   │       └── page.tsx     \# Detail page

│   ├── categories/

│   ├── search/

│   └── layout.tsx           \# Public layout

│

├── admin/                    \# Admin area

│   ├── layout.tsx           \# Admin layout

│   ├── opportunities/

│   │   ├── new/

│   │   ├── \[id\]/edit/

│   │   └── page.tsx         \# List all

│   └── dashboard/

│

└── api/                      \# API routes

**Component Organization:**

components/

├── ui/                       \# shadcn/ui components

│   ├── button.tsx

│   ├── input.tsx

│   └── ...

│

├── opportunities/

│   ├── OpportunityCard.tsx

│   ├── OpportunityList.tsx

│   ├── OpportunityFilters.tsx

│   └── OpportunityDetail.tsx

│

├── admin/

│   ├── MarkdownEditor.tsx

│   ├── OpportunityForm.tsx

│   └── BulkImport.tsx

│

├── search/

│   ├── SearchBar.tsx

│   ├── SearchResults.tsx

│   └── FilterPanel.tsx

│

└── shared/

    ├── Navbar.tsx

    ├── Footer.tsx

    └── RealTimeIndicator.tsx

### Server vs Client Components

**Server Components (Default):**

Use for:

- Static content  
- Data fetching  
- SEO-important pages  
- Initial page loads

**Examples:**

- Opportunity list page  
- Individual opportunity pages  
- Category pages  
- Homepage

**Client Components ('use client'):**

Use for:

- Interactivity (forms, buttons)  
- Browser APIs (localStorage, geolocation)  
- Real-time updates (WebSocket)  
- State management (useState, useContext)

**Examples:**

- Search filters  
- Markdown editor  
- Real-time notifications  
- Save/bookmark buttons

### Data Fetching Patterns

**Server Components:**

Direct database queries via Prisma:

async function getOpportunity(slug) {

  const opportunity \= await prisma.opportunity.findUnique({

    where: { slug },

    include: {

      tags: true,

      benefits: true,

      timeline: true

    }

  })

  return opportunity

}

**Advantages:**

- No API route needed  
- Type-safe  
- Fast (direct database)  
- Cached automatically

**Client Components:**

Using SWR or React Query:

- Fetch from API routes  
- Client-side caching  
- Automatic revalidation  
- Optimistic updates

### State Management

**Server State:**

React Query (or SWR) for:

- API data  
- Search results  
- User-specific data

**Client State:**

- Zustand for global state  
- React Context for theme, auth  
- URL state for filters, pagination

**Form State:**

React Hook Form with Zod validation.

### Real-time Integration

**Hook for WebSocket:**

Custom hook wraps Pusher client:

**Usage:**

const { lastMessage } \= useChannel('opportunities')

useEffect(() \=\> {

  if (lastMessage?.event \=== 'opportunity.created') {

    // Show notification

    // Optionally refetch data

  }

}, \[lastMessage\])

**Optimistic Updates:**

When user saves opportunity:

1. Update local cache immediately  
2. Show success state  
3. Send request to server  
4. If fails, rollback and show error

### Responsive Design

**Breakpoints:**

- Mobile: \< 640px  
- Tablet: 640px \- 1024px  
- Desktop: \> 1024px

**Mobile-first Approach:**

Design for mobile, enhance for desktop.

**Key Adaptations:**

**Navigation:**

- Mobile: Hamburger menu  
- Desktop: Full horizontal nav

**Filters:**

- Mobile: Drawer/modal  
- Desktop: Sidebar

**Opportunity Cards:**

- Mobile: Stacked, full-width  
- Desktop: Grid (2-3 columns)

**Detail Page:**

- Mobile: Single column  
- Desktop: Two columns (main \+ sidebar)

### Performance Optimizations

**Image Optimization:**

Using Next.js Image component:

- Automatic WebP/AVIF  
- Lazy loading  
- Responsive sizes  
- Blur placeholders

**Code Splitting:**

- Route-based splitting (automatic)  
- Dynamic imports for large components  
- Lazy load admin components

**Prefetching:**

- Link prefetching (Next.js default)  
- Prefetch search results on filter hover  
- Prefetch opportunity details on card hover

**Bundle Size:**

- Tree-shaking unused code  
- Analyze bundle with `@next/bundle-analyzer`  
- Limit client-side JavaScript

### Accessibility

**WCAG 2.1 Level AA Compliance:**

- Semantic HTML  
- ARIA labels where needed  
- Keyboard navigation  
- Focus management  
- Screen reader tested

**Specific Considerations:**

- Skip to content link  
- Form labels and error messages  
- Color contrast ratios  
- Alternative text for images  
- Announcement of dynamic updates

---

## Deployment Strategy

### Hosting Platform

**Primary: Vercel**

**Why Vercel:**

- Native Next.js support  
- Edge network (global CDN)  
- Automatic HTTPS  
- Preview deployments  
- Zero-config setup  
- Excellent performance  
- Built-in analytics

**Database: Neon or Supabase**

**Neon:**

- Serverless PostgreSQL  
- Database branching (dev/staging/prod)  
- Instant scaling  
- Pay per use  
- Excellent Next.js integration

**Supabase:**

- PostgreSQL with extras  
- Built-in auth (optional)  
- Real-time subscriptions  
- Storage (for markdown backups)  
- Dashboard for management

**Vector Database: Pinecone**

- Managed service  
- No infrastructure management  
- Free tier available

**Real-time: Pusher or Ably**

- Both have generous free tiers  
- Managed infrastructure  
- Easy Next.js integration

### Environment Structure

**Three Environments:**

**Development:**

- Local machine  
- Local PostgreSQL or Neon dev branch  
- Local Pinecone index  
- Environment: `.env.local`

**Staging:**

- Vercel preview deployment  
- Staging database (Neon branch)  
- Staging Pinecone index  
- Triggered on: Push to `develop` branch

**Production:**

- Vercel production deployment  
- Production database  
- Production Pinecone index  
- Triggered on: Push to `main` branch

### Deployment Workflow

**Git Flow:**

main (production)

├── develop (staging)

│   └── feature/\* (local)

**Process:**

1. Create feature branch from `develop`  
2. Develop locally  
3. Push to trigger preview deployment  
4. Test on preview URL  
5. Merge to `develop` (triggers staging)  
6. Test on staging  
7. Merge to `main` (triggers production)

**Automatic Deployments:**

Vercel automatically deploys on git push:

- Preview: Every push to feature branch  
- Staging: Push to develop  
- Production: Push to main

**Manual Deployments:**

Redeploy from Vercel dashboard or CLI.

### Database Migrations

**Using Prisma Migrate:**

**Development:**

npx prisma migrate dev \--name description

Creates migration file and applies to dev database.

**Staging/Production:**

npx prisma migrate deploy

Applies pending migrations.

**Process:**

1. Create migration locally  
2. Commit migration files  
3. Push to git  
4. Vercel build runs migrations automatically  
5. Deployment continues

**Rollback Strategy:**

If migration fails:

- Vercel deployment fails (safe)  
- Fix migration  
- Redeploy

If bad migration deployed:

- Revert git commit  
- Redeploy  
- Create new migration to fix

### Environment Variables

**Stored in:**

- Local: `.env.local` (gitignored)  
- Vercel: Environment Variables dashboard

**Required Variables:**

**Database:**

- `DATABASE_URL` \- PostgreSQL connection string  
- `DIRECT_URL` \- Direct connection (for migrations)

**AI:**

- `GOOGLE_API_KEY` - Gemini API key  
- `OPENAI_API_KEY` \- For embeddings

**Vector:**

- `PINECONE_API_KEY`  
- `PINECONE_ENVIRONMENT`  
- `PINECONE_INDEX_NAME`

**Real-time:**

- `PUSHER_APP_ID`  
- `PUSHER_KEY`  
- `PUSHER_SECRET`  
- `PUSHER_CLUSTER`

**Auth:**

- `NEXTAUTH_SECRET` \- Random string  
- `NEXTAUTH_URL` \- App URL

**Email:**

- `RESEND_API_KEY`

**Monitoring:**

- `SENTRY_DSN` (optional)

### CI/CD Pipeline

**GitHub Actions (Optional):**

Run on every push:

1. Lint code  
2. Run tests  
3. Type check  
4. Build locally

**Vercel handles:**

- Build  
- Deploy  
- Migrations  
- Environment setup

### Monitoring Production

**Vercel Analytics:**

Built-in metrics:

- Page views  
- Unique visitors  
- Top pages  
- Slowest pages  
- Core Web Vitals

**External Monitoring:**

**Sentry (Error Tracking):**

- JavaScript errors  
- API errors  
- Performance monitoring  
- User context

**Uptime Monitoring:**

Service like UptimeRobot:

- Ping production URL every 5 minutes  
- Alert on downtime  
- Status page

**Database Monitoring:**

Neon/Supabase dashboard:

- Query performance  
- Connection pooling  
- Storage usage  
- Slow queries

**Log Management:**

Vercel logs or external service:

- Application logs  
- API request logs  
- Error logs

### Backup Strategy

**Database Backups:**

**Automated:**

- Neon: Daily automatic backups (7 day retention)  
- Manual backups before major changes

**Point-in-time Recovery:**

- Neon supports PITR  
- Can restore to any point in last 7 days

**Pinecone Backups:**

Pinecone manages internally, but:

- Export opportunity IDs periodically  
- Can regenerate embeddings if needed

**Code Backups:**

Git is source of truth:

- GitHub repository  
- Multiple clones  
- Tagged releases

### Disaster Recovery

**Database Corruption:**

- Restore from latest Neon backup  
- Replay recent transactions if available

**Code Deployment Failure:**

- Vercel keeps previous deployments  
- Instant rollback via dashboard

**Complete Outage:**

Recovery plan:

1. Identify issue (monitoring alerts)  
2. Check Vercel status page  
3. Check database status  
4. Rollback recent deployment if needed  
5. Restore database if corrupted  
6. Communicate with users

**RTO (Recovery Time Objective):** 1 hour **RPO (Recovery Point Objective):** 24 hours (max data loss)

---

## Performance Optimization

### Core Web Vitals Targets

**Largest Contentful Paint (LCP):** \< 2.5s **First Input Delay (FID):** \< 100ms **Cumulative Layout Shift (CLS):** \< 0.1

### Optimization Strategies

**1\. Static Generation**

Generate as much as possible at build time:

- Homepage  
- Category pages (common ones)  
- Popular opportunities

**2\. Incremental Static Regeneration**

Balance freshness and performance:

- Homepage: Revalidate every 60s  
- Opportunity pages: 24 hours  
- Category pages: 5 minutes

**3\. Edge Caching**

Leverage Vercel Edge Network:

- Static assets cached at edge  
- API responses cached with tags  
- Geographically distributed

**4\. Database Optimization**

**Connection Pooling:** Using Prisma with connection pooling.

**Query Optimization:**

- Use indexes effectively  
- Avoid N+1 queries  
- Use `select` to fetch only needed fields  
- Use `include` judiciously

**Caching:**

- Redis for frequently accessed data  
- Cache aggregations (counts, stats)

**5\. Image Optimization**

- Next.js Image component  
- WebP/AVIF formats  
- Responsive images  
- Lazy loading  
- Blur placeholders

**6\. Code Optimization**

- Tree-shaking  
- Minimize client JavaScript  
- Code splitting  
- Dynamic imports  
- Remove unused dependencies

**7\. Font Optimization**

Next.js automatic font optimization:

- Self-host fonts  
- Preload critical fonts  
- Font-display: swap

### Bundle Size Management

**Target:**

Total JavaScript \< 200KB (gzipped)

**Strategies:**

- Use Server Components (zero JS)  
- Dynamic imports for modals, heavy components  
- Analyze bundle regularly  
- Lazy load non-critical features

**Tools:**

- `@next/bundle-analyzer`  
- Vercel Analytics bundle insights

### Monitoring Performance

**Real User Monitoring (RUM):**

Vercel Analytics provides:

- Actual user metrics  
- Geographic breakdown  
- Device breakdown  
- Page-by-page analysis

**Synthetic Monitoring:**

Tools:

- Lighthouse CI  
- WebPageTest  
- SpeedCurve

**Performance Budget:**

Set budgets:

- Max bundle size: 200KB  
- Max LCP: 2.5s  
- Max API response: 500ms

Fail builds if exceeded (optional).

---

## Security Considerations

### Authentication & Authorization

**Admin Authentication:**

NextAuth.js with:

- Email/password (bcrypt hashed)  
- Session tokens (JWT or database)  
- CSRF protection

**Role-Based Access Control:**

Roles:

- ADMIN: Full access  
- CURATOR: Add/edit opportunities  
- USER: Browse, save

**API Security:**

- Rate limiting (prevent abuse)  
- Input validation (Zod schemas)  
- SQL injection prevention (Prisma ORM)  
- XSS prevention (React escaping)

### Data Security

**Database:**

- SSL connections (enforced)  
- Row-level security (if using Supabase)  
- Regular backups  
- Encryption at rest (provider-managed)

**Environment Variables:**

- Never commit to git  
- Use Vercel secrets  
- Rotate regularly

**API Keys:**

- Store securely  
- Use different keys per environment  
- Rotate if compromised

### GDPR Compliance

**User Data:**

- Collect only necessary data  
- Clear privacy policy  
- Allow data export  
- Allow account deletion

**Cookies:**

- Cookie consent banner  
- Document cookie usage  
- Allow opt-out

**Email Communications:**

- Unsubscribe link in all emails  
- Honor unsubscribe immediately  
- Clear opt-in process

### Content Security

**Markdown Safety:**

When rendering user-submitted markdown:

- Sanitize HTML  
- Strip dangerous tags  
- No inline JavaScript  
- Use DOMPurify or similar

**XSS Prevention:**

- React's automatic escaping  
- CSP headers  
- Validate all inputs

**CSRF Prevention:**

- NextAuth handles automatically  
- SameSite cookies  
- CSRF tokens on forms

### Infrastructure Security

**Vercel:**

- Automatic HTTPS  
- DDoS protection  
- Firewall rules

**Database:**

- IP allowlist (if needed)  
- Strong passwords  
- No public access

**Third-party Services:**

- Use official SDKs  
- Keep dependencies updated  
- Monitor for vulnerabilities

### Monitoring & Incident Response

**Security Monitoring:**

- Log suspicious activity  
- Alert on multiple failed logins  
- Monitor API abuse

**Incident Response Plan:**

1. Detect (monitoring alerts)  
2. Contain (disable affected features)  
3. Investigate (check logs)  
4. Fix (patch vulnerability)  
5. Communicate (inform users if needed)  
6. Review (prevent recurrence)

---

## Monitoring & Analytics

### Application Monitoring

**Error Tracking:**

**Sentry:**

- JavaScript errors  
- API errors  
- Performance monitoring  
- User feedback  
- Release tracking

**Log Management:**

**Vercel Logs:**

- Build logs  
- Runtime logs  
- API request logs

**External Options:**

- Logtail  
- Datadog  
- New Relic

### Performance Monitoring

**Real User Monitoring:**

Vercel Analytics:

- Core Web Vitals  
- Page load times  
- Geographic performance  
- Device performance

**Synthetic Monitoring:**

Regular checks:

- Uptime  
- Response times  
- Functionality

### Business Analytics

**Usage Metrics:**

Track:

- Daily active users  
- Opportunities viewed  
- Searches performed  
- Applications clicked  
- Opportunities saved

**Content Metrics:**

- Most popular opportunities  
- Most searched keywords  
- Popular categories  
- Top companies  
- Geographic distribution

**Curator Metrics:**

- Opportunities added per day  
- Average completeness score  
- AI confidence scores  
- Time to publish

### Search Analytics

**Track:**

- Search queries  
- Zero-result searches  
- Low-result searches  
- Search-to-click rate  
- Popular filters

**Use for:**

- Identify content gaps  
- Improve search relevance  
- Understand user intent  
- Add new categories

### User Behavior Analytics

**Heatmaps & Session Recording:**

Tools like:

- Hotjar  
- FullStory  
- Microsoft Clarity

**Insights:**

- Where users click  
- How they navigate  
- Where they struggle  
- Drop-off points

### A/B Testing

**Test:**

- Different layouts  
- Filter arrangements  
- Search algorithm tweaks  
- Call-to-action text

**Tools:**

- Vercel Edge Middleware for routing  
- Analytics to measure impact

### Dashboard

**Admin Dashboard:**

Single view showing:

- Active opportunities count  
- Expiring soon count  
- Today's views  
- Today's searches  
- Recent activity  
- Popular opportunities  
- Trending searches

**Curator Dashboard:**

- Your opportunities  
- Performance of your posts  
- Suggested edits (low completeness)  
- Opportunities needing updates

---

## Future Enhancements

### Phase 2 Features

**User Accounts:**

- Save opportunities  
- Track applications  
- Set preferences  
- Email alerts

**Personalization:**

- Recommended opportunities  
- Customized feed  
- Smart notifications

**Social Features:**

- Share opportunities  
- Review companies  
- Discuss opportunities (comments)

**Mobile Apps:**

- iOS app (React Native or Swift)  
- Android app (React Native or Kotlin)  
- Push notifications

### Advanced AI Features

**Smart Recommendations:**

- ML-based ranking  
- Collaborative filtering  
- Personalized suggestions

**Application Assistance:**

- Resume tailoring  
- Cover letter generation  
- Interview preparation

**Company Insights:**

- Sentiment analysis from reviews  
- Culture matching  
- Salary predictions

**Auto-categorization Improvement:**

- Learn from corrections  
- Suggest new categories  
- Detect emerging trends

### Platform Expansion

**API for Partners:**

- Public API access  
- Webhooks  
- Embeddable widgets

**Browser Extension:**

- Verify opportunities on other sites  
- One-click save  
- Scam detection

**Integrations:**

- LinkedIn  
- Indeed  
- Google Calendar (deadline reminders)  
- Email providers

### Advanced Search

**Natural Language Search:**

"Find remote ML internships paying over $5k/month starting this summer"

**Image Search:**

Upload company logo, find opportunities.

**Voice Search:**

Mobile voice input.

### Analytics & Insights

**Opportunity Insights:**

- Application success rates  
- Average competition level  
- Best time to apply

**Market Trends:**

- Hiring trends by category  
- Salary trends  
- Location trends  
- Skills demand

### Community Features

**User Contributions:**

- User-submitted opportunities (moderated)  
- Reviews and ratings  
- Success stories

**Forums/Discussions:**

- Application tips  
- Company discussions  
- Career advice

---

## Conclusion

This documentation provides a complete blueprint for building an AI-powered opportunity aggregation platform using modern JavaScript technologies.

### Key Takeaways

**Architecture:**

- Next.js for full-stack development  
- PostgreSQL for relational data  
- Pinecone for semantic search  
- LangChain for AI orchestration  
- Real-time updates via WebSocket

**Workflow:**

- You curate opportunities (quality)  
- AI structures data (efficiency)  
- Users discover easily (experience)

**Performance:**

- Edge-first caching  
- Smart revalidation  
- Real-time synchronization

**Scalability:**

- Serverless architecture  
- Managed services  
- Horizontal scaling

### Implementation Roadmap

**Phase 1 (MVP \- 6-8 weeks):**

- Database schema  
- Basic admin CMS  
- AI markdown parser  
- Public browsing interface  
- Basic search

**Phase 2 (3-4 weeks):**

- Vector search integration  
- Real-time updates  
- Advanced filtering  
- Performance optimization

**Phase 3 (4-6 weeks):**

- User accounts  
- Saved opportunities  
- Email notifications  
- Analytics dashboard

**Phase 4 (Ongoing):**

- Mobile apps  
- Advanced AI features  
- Platform integrations  
- Community features

### Success Metrics

**Quality:**

- 90% opportunity accuracy  
- \<5% flagged as low quality  
- 80% completeness score average

**Performance:**

- \<2s page load (LCP)  
- 95% uptime  
- \<500ms API response

**Engagement:**

- 70% returning users  
- 5 min average session  
- 40% click-through to applications

**Growth:**

- 50 new opportunities/week (Year 1\)  
- 1000+ active users (6 months)  
- 10,000+ active users (Year 1\)

This platform combines the best of human curation and AI automation to create a truly valuable resource for opportunity seekers. The technical foundation is solid, scalable, and built on proven technologies.  