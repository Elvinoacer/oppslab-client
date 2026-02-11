-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'GRANT', 'FELLOWSHIP', 'SCHOLARSHIP', 'RESEARCH', 'VOLUNTEER', 'APPRENTICESHIP', 'COMPETITION', 'PROGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'GOVERNMENT', 'NONPROFIT', 'CONSULTING', 'MEDIA', 'ENTERTAINMENT', 'RETAIL', 'MANUFACTURING', 'ENERGY', 'REAL_ESTATE', 'LEGAL', 'AGRICULTURE', 'TRANSPORTATION', 'HOSPITALITY', 'TELECOMMUNICATIONS', 'AEROSPACE', 'BIOTECHNOLOGY', 'AUTOMOTIVE', 'CONSTRUCTION', 'ECOMMERCE', 'GAMING', 'CRYPTO_BLOCKCHAIN', 'AI_ML', 'CYBERSECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('BACKEND_ENGINEER', 'FRONTEND_ENGINEER', 'FULLSTACK_ENGINEER', 'MOBILE_DEVELOPER', 'DEVOPS_ENGINEER', 'DATA_ENGINEER', 'ML_ENGINEER', 'SECURITY_ENGINEER', 'QA_ENGINEER', 'EMBEDDED_SYSTEMS', 'DATA_SCIENTIST', 'DATA_ANALYST', 'BUSINESS_ANALYST', 'PRODUCT_ANALYST', 'UX_DESIGNER', 'UI_DESIGNER', 'PRODUCT_DESIGNER', 'GRAPHIC_DESIGNER', 'PRODUCT_MANAGER', 'PROJECT_MANAGER', 'ENGINEERING_MANAGER', 'PROGRAM_MANAGER', 'TECHNICAL_PROGRAM_MANAGER', 'RESEARCHER', 'RESEARCH_SCIENTIST', 'RESEARCH_ASSISTANT', 'SALES', 'MARKETING', 'BUSINESS_DEVELOPMENT', 'OPERATIONS', 'FINANCE_ANALYST', 'ACCOUNTANT', 'HR_SPECIALIST', 'CONSULTANT', 'WRITER', 'CONTENT_CREATOR', 'COMMUNITY_MANAGER', 'CUSTOMER_SUCCESS', 'SUPPORT_ENGINEER', 'LEGAL_COUNSEL', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('STUDENT', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR', 'LEAD', 'PRINCIPAL', 'EXECUTIVE', 'ANY');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'FILLED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('SALARY', 'HOURLY', 'STIPEND', 'PRIZE', 'EQUITY', 'UNPAID', 'NEGOTIABLE', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "CompensationPeriod" AS ENUM ('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR', 'PROJECT', 'TOTAL');

-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('URL', 'EMAIL', 'BOTH', 'PORTAL', 'IN_PERSON', 'OTHER');

-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('LINKEDIN', 'INDEED', 'GLASSDOOR', 'HANDSHAKE', 'ANGELLIST', 'GREENHOUSE', 'LEVER', 'WORKDAY', 'COMPANY_WEBSITE', 'UNIVERSITY_BOARD', 'GOVERNMENT_PORTAL', 'NEWSLETTER', 'TWITTER_X', 'DISCORD', 'SLACK', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CURATOR', 'USER');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('SKILL', 'PROGRAM', 'BENEFIT', 'LOCATION', 'TECHNOLOGY', 'CERTIFICATION', 'INDUSTRY', 'MISC');

-- CreateEnum
CREATE TYPE "EligibilityType" AS ENUM ('CITIZENSHIP', 'AGE', 'ENROLLMENT', 'LOCATION', 'GPA', 'DEGREE', 'VISA', 'BACKGROUND_CHECK', 'CLEARANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('HEALTH_INSURANCE', 'DENTAL_INSURANCE', 'VISION_INSURANCE', 'LIFE_INSURANCE', 'DISABILITY_INSURANCE', 'RETIREMENT_401K', 'HOUSING', 'RELOCATION', 'SIGNING_BONUS', 'PERFORMANCE_BONUS', 'STOCK_OPTIONS', 'RSU', 'PTO', 'PARENTAL_LEAVE', 'MENTORSHIP', 'TRAINING', 'EQUIPMENT', 'MEALS', 'TRANSPORTATION', 'GYM_MEMBERSHIP', 'REMOTE_STIPEND', 'EDUCATION_REIMBURSEMENT', 'PROFESSIONAL_DEVELOPMENT', 'CONFERENCE_BUDGET', 'OTHER');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('RESUME', 'COVER_LETTER', 'TRANSCRIPT', 'PORTFOLIO', 'REFERENCES', 'WRITING_SAMPLE', 'CODE_SAMPLE', 'VIDEO_INTRO', 'WORK_SAMPLES', 'CERTIFICATIONS', 'RECOMMENDATION_LETTERS', 'ESSAYS', 'OTHER');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('APPLICATION_OPEN', 'APPLICATION_DEADLINE', 'EARLY_DEADLINE', 'PRIORITY_DEADLINE', 'INTERVIEW_PERIOD', 'ASSESSMENT_DATE', 'DECISION_DATE', 'ACCEPTANCE_DEADLINE', 'START_DATE', 'END_DATE', 'ORIENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RECRUITER', 'HR', 'HIRING_MANAGER', 'PROGRAM_COORDINATOR', 'TALENT_ACQUISITION', 'GENERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'PUBLISHED', 'ARCHIVED', 'RESTORED', 'DELETED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NOT_APPLIED', 'SAVED', 'APPLYING', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEWING', 'ASSESSMENT', 'FINAL_ROUND', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "originalMarkdown" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" VARCHAR(300),
    "primaryCategory" "OpportunityCategory" NOT NULL,
    "industry" "Industry",
    "roleType" "RoleType",
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'ANY',
    "workMode" "WorkMode",
    "locationRaw" TEXT,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "locationCoordinates" JSONB,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "isRolling" BOOLEAN NOT NULL DEFAULT false,
    "compensationType" "CompensationType" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "compensationMin" DECIMAL(12,2),
    "compensationMax" DECIMAL(12,2),
    "compensationCurrency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "compensationPeriod" "CompensationPeriod",
    "compensationRaw" TEXT,
    "educationRequirements" TEXT[],
    "skillsRequired" TEXT[],
    "experienceRequired" TEXT,
    "minimumGPA" DECIMAL(3,2),
    "languageRequirements" TEXT[],
    "applicationUrl" TEXT,
    "applicationEmail" TEXT,
    "applicationMethod" "ApplicationMethod",
    "applicationInstructions" TEXT,
    "sourcePlatform" "SourcePlatform",
    "sourceUrl" TEXT,
    "curatedById" TEXT,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "completenessScore" INTEGER NOT NULL DEFAULT 0,
    "aiConfidenceScore" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" VARCHAR(160),
    "keywords" TEXT[],
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL DEFAULT 'MISC',
    "description" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(7),
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityTag" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" VARCHAR(7),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "level" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "opportunityCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityCategory_Rel" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityCategory_Rel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityCriteria" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "criterionType" "EligibilityType" NOT NULL,
    "criterionValue" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "benefitType" "BenefitType" NOT NULL,
    "description" TEXT,
    "value" DECIMAL(12,2),
    "isIncluded" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredMaterial" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "materialType" "MaterialType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "instructions" TEXT,
    "format" TEXT,
    "maxPages" INTEGER,
    "maxSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequiredMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventDateEnd" TIMESTAMP(3),
    "description" TEXT,
    "isEstimate" BOOLEAN NOT NULL DEFAULT false,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "contactType" "ContactType" NOT NULL DEFAULT 'GENERAL',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "linkedinUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityHistory" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "changeType" "ChangeType" NOT NULL,
    "fieldName" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "fullSnapshot" JSONB,

    CONSTRAINT "OpportunityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "hashedPassword" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SavedOpportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "folderName" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "statusUpdatedAt" TIMESTAMP(3),
    "reminderDate" TIMESTAMP(3),

    CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "filters" JSONB NOT NULL,
    "alertFrequency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastAlertedAt" TIMESTAMP(3),
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "clickedOpportunityId" TEXT,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceType" "DeviceType",
    "userAgent" TEXT,
    "ipHash" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VectorEmbedding" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "pineconeId" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "embeddedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "needsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "contentHash" TEXT,

    CONSTRAINT "VectorEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalActive" INTEGER NOT NULL DEFAULT 0,
    "totalDrafts" INTEGER NOT NULL DEFAULT 0,
    "totalExpired" INTEGER NOT NULL DEFAULT 0,
    "expiringSoon" INTEGER NOT NULL DEFAULT 0,
    "newOpportunities" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalSearches" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "topCategories" JSONB,
    "topIndustries" JSONB,
    "topLocations" JSONB,
    "topCompanies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");

-- CreateIndex
CREATE INDEX "Opportunity_status_deadline_idx" ON "Opportunity"("status", "deadline");

-- CreateIndex
CREATE INDEX "Opportunity_primaryCategory_idx" ON "Opportunity"("primaryCategory");

-- CreateIndex
CREATE INDEX "Opportunity_industry_idx" ON "Opportunity"("industry");

-- CreateIndex
CREATE INDEX "Opportunity_roleType_idx" ON "Opportunity"("roleType");

-- CreateIndex
CREATE INDEX "Opportunity_experienceLevel_idx" ON "Opportunity"("experienceLevel");

-- CreateIndex
CREATE INDEX "Opportunity_workMode_idx" ON "Opportunity"("workMode");

-- CreateIndex
CREATE INDEX "Opportunity_locationCountry_locationCity_idx" ON "Opportunity"("locationCountry", "locationCity");

-- CreateIndex
CREATE INDEX "Opportunity_isRemote_idx" ON "Opportunity"("isRemote");

-- CreateIndex
CREATE INDEX "Opportunity_createdAt_idx" ON "Opportunity"("createdAt");

-- CreateIndex
CREATE INDEX "Opportunity_publishedAt_idx" ON "Opportunity"("publishedAt");

-- CreateIndex
CREATE INDEX "Opportunity_company_idx" ON "Opportunity"("company");

-- CreateIndex
CREATE INDEX "Opportunity_status_primaryCategory_industry_idx" ON "Opportunity"("status", "primaryCategory", "industry");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "Tag_usageCount_idx" ON "Tag"("usageCount");

-- CreateIndex
CREATE INDEX "OpportunityTag_tagId_idx" ON "OpportunityTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityTag_opportunityId_tagId_key" ON "OpportunityTag"("opportunityId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_level_idx" ON "Category"("level");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "OpportunityCategory_Rel_categoryId_idx" ON "OpportunityCategory_Rel"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityCategory_Rel_opportunityId_categoryId_key" ON "OpportunityCategory_Rel"("opportunityId", "categoryId");

-- CreateIndex
CREATE INDEX "EligibilityCriteria_opportunityId_idx" ON "EligibilityCriteria"("opportunityId");

-- CreateIndex
CREATE INDEX "EligibilityCriteria_criterionType_idx" ON "EligibilityCriteria"("criterionType");

-- CreateIndex
CREATE INDEX "Benefit_opportunityId_idx" ON "Benefit"("opportunityId");

-- CreateIndex
CREATE INDEX "Benefit_benefitType_idx" ON "Benefit"("benefitType");

-- CreateIndex
CREATE INDEX "RequiredMaterial_opportunityId_idx" ON "RequiredMaterial"("opportunityId");

-- CreateIndex
CREATE INDEX "TimelineEvent_opportunityId_idx" ON "TimelineEvent"("opportunityId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventType_idx" ON "TimelineEvent"("eventType");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventDate_idx" ON "TimelineEvent"("eventDate");

-- CreateIndex
CREATE INDEX "Contact_opportunityId_idx" ON "Contact"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityHistory_opportunityId_idx" ON "OpportunityHistory"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityHistory_changedAt_idx" ON "OpportunityHistory"("changedAt");

-- CreateIndex
CREATE INDEX "OpportunityHistory_changeType_idx" ON "OpportunityHistory"("changeType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "SavedOpportunity_userId_idx" ON "SavedOpportunity"("userId");

-- CreateIndex
CREATE INDEX "SavedOpportunity_status_idx" ON "SavedOpportunity"("status");

-- CreateIndex
CREATE INDEX "SavedOpportunity_folderName_idx" ON "SavedOpportunity"("folderName");

-- CreateIndex
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "SavedOpportunity"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "SavedSearch_isActive_idx" ON "SavedSearch"("isActive");

-- CreateIndex
CREATE INDEX "SearchQuery_userId_idx" ON "SearchQuery"("userId");

-- CreateIndex
CREATE INDEX "SearchQuery_searchedAt_idx" ON "SearchQuery"("searchedAt");

-- CreateIndex
CREATE INDEX "SearchQuery_query_idx" ON "SearchQuery"("query");

-- CreateIndex
CREATE UNIQUE INDEX "VectorEmbedding_opportunityId_key" ON "VectorEmbedding"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "VectorEmbedding_pineconeId_key" ON "VectorEmbedding"("pineconeId");

-- CreateIndex
CREATE INDEX "VectorEmbedding_needsUpdate_idx" ON "VectorEmbedding"("needsUpdate");

-- CreateIndex
CREATE INDEX "Draft_userId_idx" ON "Draft"("userId");

-- CreateIndex
CREATE INDEX "Draft_updatedAt_idx" ON "Draft"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformStats_date_key" ON "PlatformStats"("date");

-- CreateIndex
CREATE INDEX "PlatformStats_date_idx" ON "PlatformStats"("date");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_curatedById_fkey" FOREIGN KEY ("curatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityTag" ADD CONSTRAINT "OpportunityTag_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityTag" ADD CONSTRAINT "OpportunityTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityCategory_Rel" ADD CONSTRAINT "OpportunityCategory_Rel_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityCategory_Rel" ADD CONSTRAINT "OpportunityCategory_Rel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCriteria" ADD CONSTRAINT "EligibilityCriteria_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequiredMaterial" ADD CONSTRAINT "RequiredMaterial_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityHistory" ADD CONSTRAINT "OpportunityHistory_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityHistory" ADD CONSTRAINT "OpportunityHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_clickedOpportunityId_fkey" FOREIGN KEY ("clickedOpportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VectorEmbedding" ADD CONSTRAINT "VectorEmbedding_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
