# Manual Testing Guide (Comprehensive)

This guide covers all implemented features of the Opportunity Aggregator. Follow these steps to verify the system functionality end-to-end.

## Prerequisites

1.  **Server Running**: `npm start` (or `npm run dev`) at `http://localhost:3000`
2.  **Database**: PostgreSQL must be running and migrated (`npx prisma migrate deploy`)
3.  **Vector DB**: Pinecone index `opportunities-gemini` (Dimension: 768)
4.  **Environment**: `.env` file fully configured

---

## 1. Authentication & User Roles

### 1.1 Sign Up / Sign In
*   **Action**: Go to `/auth/signin`.
*   **Verify**:
    *   [ ] **Sign In Page**: Loads correctly.
    *   [ ] **OAuth Providers**: Buttons for Google/GitHub (if configured) are visible.
    *   [ ] **Credentials**: Can sign in with email/password (if seed user exists).
    *   [ ] **Redirect**: After login, redirects to `/dashboard` or previous page.

---

## 2. Public Interface Testing

### 2.1 Homepage (`/`)
*   **Action**: Navigate to `http://localhost:3000`.
*   **Verify**:
    *   [ ] **Hero Section**: Loads with "Find your next opportunity" text.
    *   [ ] **Search Bar**: Type a term (e.g., "Engineer") and hit Enter. Should redirect to `/search?q=Engineer`.
    *   [ ] **Quick Filters**: Click a category pill (e.g., "Engineering"). Should redirect to filtered results.
    *   [ ] **Stats**: Verify numbers (Active Jobs, Companies, etc.) are displayed.

### 2.2 Search & Discovery (`/search`)
*   **Action**: Go to `/search`.
*   **Verify**:
    *   [ ] **Empty State**: Shows "Start searching..." or default results.
    *   [ ] **Text Search**: Enter "React" -> Results contain "React".
    *   [ ] **Semantic Search**: Enter "coding jobs for beginners". Results should correspond to intent.
    *   [ ] **Filters**: Test Location and Level filters. Results update dynamically.
    *   [ ] **Save Search**: (If logged in) Click "Save Search". Verify it appears in Dashboard.

### 2.3 Opportunities List (`/opportunities`)
*   **Action**: Go to `/opportunities`.
*   **Verify**:
    *   [ ] **Grid View**: Cards display Title, Company, Location, and Tags.
    *   [ ] **Pagination**: "Load More" or pagination controls work.
    *   [ ] **Sorting**: "Newest" sorts by date.

### 2.4 Opportunity Detail (`/opportunities/[slug]`)
*   **Action**: Click any opportunity card.
*   **Verify**:
    *   [ ] **Content**: Title, Company, Description render.
    *   [ ] **Metadata**: Deadline, Location, Salary visible.
    *   [ ] **Save Opportunity**: Click "Save/Bookmark" icon. Button state changes selected.
    *   [ ] **Apply Button**: "Apply Now" opens external URL.

---

## 3. User Dashboard (Authenticated)

### 3.1 Overview (`/dashboard`)
*   **Action**: Go to `/dashboard`.
*   **Verify**:
    *   [ ] **Welcome Message**: Displays user's name.
    *   [ ] **Stats Cards**: Displays counts for Saved Opportunities and Saved Searches.
    *   [ ] **Navigation**: Links to sub-pages work.

### 3.2 Saved Opportunities (`/dashboard/saved`)
*   **Action**: Click "Saved Opportunities" card.
*   **Verify**:
    *   [ ] **List**: Shows opportunities saved in step 2.4.
    *   [ ] **Link**: Clicking an item goes to its detail page.
    *   [ ] **Remove**: (If available) Ability to unsave/remove an item.

### 3.3 Saved Searches (`/dashboard/searches`)
*   **Action**: Click "Saved Searches" card.
*   **Verify**:
    *   [ ] **List**: Shows searches saved in step 2.2.
    *   [ ] **Execute**: Clicking a search runs it again.

### 3.4 Profile Settings (`/dashboard/settings`)
*   **Action**: Go to Settings.
*   **Verify**:
    *   [ ] **Form**: Can update Name, Bio, or Location.
    *   [ ] **Save**: "Save Changes" persists data.

---

## 4. Admin Interface (The CMS)

**Note**: Requires user with `ADMIN` role.

### 4.1 Dashboard (`/admin`)
*   **Action**: Go to `/admin`.
*   **Verify**:
    *   [ ] **Overview Stats**: Total active, failing, etc.
    *   [ ] **Recent Activity**: List of recently added/edited jobs.

### 4.2 **✨ AI Parsing** (`/admin/opportunities/new`)
*   **Action**: Go to `/admin/opportunities/new`.
*   **Test Steps**:
    1.  **Paste Job Description**: Paste text from a real job post.
    2.  **Click "Parse with AI"**.
    3.  **Verify Extraction**: Title, Company, Skills, Tags auto-filled.
    *   [ ] **Review & Save**: Edit if needed, then "Save Draft" or "Publish".

### 4.3 Draft Management (`/admin/drafts`)
*   **Action**: Go to `/admin/drafts`.
*   **Verify**:
    *   [ ] **Structured Drafts**: Lists opportunities with `DRAFT` status.
    *   [ ] **Raw Drafts**: Lists unprocessed content saved during creation.
    *   [ ] **Publish All**: (If drafts exist) "Publish All Drafts" button is visible.
    *   [ ] **Resume**: Clicking "Resume" on a raw draft opens the editor.

### 4.4 Managing Opportunities (`/admin/opportunities`)
*   **Action**: Go to `/admin/opportunities`.
*   **Verify**:
    *   [ ] **List View**: See the job you just created.
    *   [ ] **Edit**: Modify title/status.
    *   [ ] **Delete/Archive**: Remove functionality working.

### 4.5 Category Management (`/admin/categories`)
*   **Action**: Go to `/admin/categories`.
*   **Verify**:
    *   [ ] **List**: Shows existing categories with opportunity counts.
    *   [ ] **Add Category**: Click "Add Category", fill form, save.
    *   [ ] **Edit**: Change name or slug of a category.

### 4.6 Admin Settings (`/admin/settings`)
*   **Action**: Go to `/admin/settings`.
*   **Verify**:
    *   [ ] **General Settings**: Can update Support Email and Platform Name.
    *   [ ] **Clear Cache**: "Clear Cache" button works (shows success toast).

### 4.7 Vector Stats (`/admin/vector-stats`)
*   **Action**: Go to `/admin/vector-stats`.
*   **Verify**:
    *   [ ] **Stats Cards**: Displays Total Vectors, Dimensions, and Index Status.
    *   [ ] **Refresh**: "Refresh Stats" updates the numbers.
    *   [ ] **Clear Database**: (Danger) "Clear Database" prompts for confirmation.

---

## 5. Background Systems Verification

### 5.1 Vector Embedding Sync
*   **Concept**: Publishing a job sends it to Pinecone.
*   **Verification**:
    1.  Create job with unique text (e.g., "zookeeping ninja").
    2.  Wait 10-20s.
    3.  Search for "tiger handler" in public search.
    4.  **Expectation**: "zookeeping ninja" job appears.

### 5.2 Scheduled Jobs
*   **Concept**: Expiration handling.
*   **Verification**: Set deadline to yesterday, wait for cron/job run, verify status becomes `EXPIRED`.

### 5.3 Analytics Processing
*   **Concept**: Aggregating views, clicks, and searches.
*   **Verification**:
    1.  Perform some searches and view opportunities.
    2.  Wait for the scheduled analytics job (or trigger manually if possible).
    3.  Check `/api/v1/stats` or Admin Dashboard to see if numbers increment.

## 6. Resume Builder (Phase 2)

### 6.1 Creating a Resume
*   **Action**: Go to `/dashboard/resumes`.
*   **Verify**:
    *   [ ] **Create Button**: "Create New Resume" button is visible.
    *   [ ] **Creation Flow**: Clicking it creates a resume and redirects to the editor.

### 6.2 Editor Functionality (`/dashboard/resumes/[id]`)
*   **Action**: Inside the resume editor.
*   **Verify**:
    *   [ ] **Live Preview**: Typing in the form updates the right-hand preview instantly.
    *   [ ] **Templates**: Switching templates (Modern, Executive, Creative) changes the layout.
    *   [ ] **Smart Sections**: Can add/remove Experience, Education, etc.

### 6.3 AI Features
*   **Action**: Click "AI Fill" (Magic Wand icon).
*   **Verify**:
    *   [ ] **Generation**: Populates fields with AI-generated content (requires valid API key).
    *   [ ] **Notifications**: Success toast appears upon completion.

### 6.4 Export
*   **Action**: Click "Download PDF".
*   **Verify**:
    *   [ ] **PDF Generation**: Browser downloads a `.pdf` file.
    *   [ ] **Quality**: content in PDF matches the preview.

---

## 7. New Category & Real-time Features

### 7.1 Task Marketplace
*   **Action**: Go to `/opportunities` and filter by "Task".
*   **Verify**:
    *   [ ] **Visuals**: Task cards have distinct blue styling.
    *   [ ] **Tags**: "Task" tag is clearly visible.

### 7.2 Real-time Notifications
*   **Action**: Open the app in two different browser windows/tabs.
*   **Simulate**: In one window (Admin), publish a new opportunity.
*   **Verify**:
    *   [ ] **Toast**: The other window receives a "New Opportunity!" toast notification.
    *   [ ] **Indicator**: Floating "New Opportunities" badge appears at bottom right.

---


## 8. Final Checklist
- [ ] Authentication (Sign In/Out) works
- [ ] User Dashboard (Saved Items) works
- [ ] Public Search (Text & Semantic) works
- [ ] Admin AI Parsing works
- [ ] Admin Drafts & Settings work
- [ ] Admin Category Management works
- [ ] Background Jobs (Vectors, Expiration, Analytics) work
- [ ] Resume Builder (Create, Edit, AI, Export) works
- [ ] Real-time Notifications work
