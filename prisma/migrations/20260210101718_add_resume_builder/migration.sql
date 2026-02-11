-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('FACT', 'TREND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OpportunityCategory" ADD VALUE 'TUTORING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'CONSULTING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'VIRTUAL_ASSISTANT';
ALTER TYPE "OpportunityCategory" ADD VALUE 'TRANSCRIPTION';
ALTER TYPE "OpportunityCategory" ADD VALUE 'TRANSLATION';
ALTER TYPE "OpportunityCategory" ADD VALUE 'COACHING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'DROPSHIPPING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'PRINT_ON_DEMAND';
ALTER TYPE "OpportunityCategory" ADD VALUE 'DIGITAL_PRODUCT';
ALTER TYPE "OpportunityCategory" ADD VALUE 'RESELLING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'HANDMADE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'CONTENT_MONETIZATION';
ALTER TYPE "OpportunityCategory" ADD VALUE 'SPONSORSHIP';
ALTER TYPE "OpportunityCategory" ADD VALUE 'NEWSLETTER';
ALTER TYPE "OpportunityCategory" ADD VALUE 'COURSE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'PODCASTING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'MEMBERSHIP';
ALTER TYPE "OpportunityCategory" ADD VALUE 'WEBSITE_FLIPPING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'DOMAIN_FLIPPING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'REAL_ESTATE_DIGITAL';
ALTER TYPE "OpportunityCategory" ADD VALUE 'TRADING_CRYPTO';
ALTER TYPE "OpportunityCategory" ADD VALUE 'TRADING_STOCK';
ALTER TYPE "OpportunityCategory" ADD VALUE 'INVESTMENT';
ALTER TYPE "OpportunityCategory" ADD VALUE 'USER_TESTING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'DATA_LABELING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'BUG_BOUNTY';
ALTER TYPE "OpportunityCategory" ADD VALUE 'AI_TRAINING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'MYSTERY_SHOPPING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'GIG';
ALTER TYPE "OpportunityCategory" ADD VALUE 'SIDE_HUSTLE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'SURVEY';
ALTER TYPE "OpportunityCategory" ADD VALUE 'AFFILIATE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'AMBASSADOR';
ALTER TYPE "OpportunityCategory" ADD VALUE 'TASK';
ALTER TYPE "OpportunityCategory" ADD VALUE 'JOB';
ALTER TYPE "OpportunityCategory" ADD VALUE 'CONFERENCE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'WORKSHOP';
ALTER TYPE "OpportunityCategory" ADD VALUE 'ACCELERATOR';
ALTER TYPE "OpportunityCategory" ADD VALUE 'FUNDING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'MENTORSHIP';
ALTER TYPE "OpportunityCategory" ADD VALUE 'HACKATHON';
ALTER TYPE "OpportunityCategory" ADD VALUE 'INCUBATOR';
ALTER TYPE "OpportunityCategory" ADD VALUE 'VOLUNTEERING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'SEMINAR';
ALTER TYPE "OpportunityCategory" ADD VALUE 'BOOTCAMP';
ALTER TYPE "OpportunityCategory" ADD VALUE 'CREATIVE';
ALTER TYPE "OpportunityCategory" ADD VALUE 'NETWORKING';
ALTER TYPE "OpportunityCategory" ADD VALUE 'CERTIFICATION';
ALTER TYPE "OpportunityCategory" ADD VALUE 'STUDY_ABROAD';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "SavedOpportunity" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "lastFollowUpAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "richProfile" JSONB,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "MarketInsight" (
    "id" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Resume',
    "template" TEXT NOT NULL DEFAULT 'modern',
    "data" JSONB NOT NULL,
    "opportunityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketInsight_type_idx" ON "MarketInsight"("type");

-- CreateIndex
CREATE INDEX "MarketInsight_validFrom_idx" ON "MarketInsight"("validFrom");

-- CreateIndex
CREATE INDEX "MarketInsight_validTo_idx" ON "MarketInsight"("validTo");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_opportunityId_idx" ON "Resume"("opportunityId");

-- CreateIndex
CREATE INDEX "Opportunity_status_primaryCategory_createdAt_idx" ON "Opportunity"("status", "primaryCategory", "createdAt");

-- CreateIndex
CREATE INDEX "Opportunity_status_isRemote_createdAt_idx" ON "Opportunity"("status", "isRemote", "createdAt");

-- CreateIndex
CREATE INDEX "Opportunity_status_publishedAt_idx" ON "Opportunity"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
