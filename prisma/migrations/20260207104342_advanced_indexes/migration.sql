-- =============================================================================
-- Advanced PostgreSQL Indexes for AI-Powered Opportunity Aggregator
-- This migration adds full-text search, trigram fuzzy matching, and array indexes
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS unaccent;    -- Remove accents for better matching

-- =============================================================================
-- FULL-TEXT SEARCH SETUP
-- =============================================================================

-- Add searchVector column if not exists (Prisma may have created it as nullable)
-- This is handled by the schema, but we ensure the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Opportunity' AND column_name = 'searchVector'
    ) THEN
        ALTER TABLE "Opportunity" ADD COLUMN "searchVector" tsvector;
    END IF;
END $$;

-- Create GIN index on searchVector for fast full-text search
CREATE INDEX IF NOT EXISTS "Opportunity_searchVector_idx" 
ON "Opportunity" USING GIN ("searchVector");

-- Create function to update search vector automatically
CREATE OR REPLACE FUNCTION opportunity_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW."searchVector" := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.company, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW."shortDescription", '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW."skillsRequired", ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW."experienceRequired", '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW."locationCity", '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW."locationCountry", '')), 'D');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update searchVector on insert/update
DROP TRIGGER IF EXISTS opportunity_search_vector_trigger ON "Opportunity";
CREATE TRIGGER opportunity_search_vector_trigger
    BEFORE INSERT OR UPDATE ON "Opportunity"
    FOR EACH ROW
    EXECUTE FUNCTION opportunity_search_vector_update();

-- =============================================================================
-- TRIGRAM INDEXES FOR FUZZY MATCHING
-- =============================================================================

-- Trigram index on title for fuzzy matching (LIKE '%query%', similarity search)
CREATE INDEX IF NOT EXISTS "Opportunity_title_trgm_idx" 
ON "Opportunity" USING GIN (title gin_trgm_ops);

-- Trigram index on company for fuzzy matching
CREATE INDEX IF NOT EXISTS "Opportunity_company_trgm_idx" 
ON "Opportunity" USING GIN (company gin_trgm_ops);

-- Trigram index on description for fuzzy matching (optional, can be heavy)
-- CREATE INDEX IF NOT EXISTS "Opportunity_description_trgm_idx" 
-- ON "Opportunity" USING GIN (description gin_trgm_ops);

-- =============================================================================
-- ARRAY INDEXES
-- =============================================================================

-- GIN index on skillsRequired array for @> (contains) operations
CREATE INDEX IF NOT EXISTS "Opportunity_skillsRequired_idx" 
ON "Opportunity" USING GIN ("skillsRequired");

-- GIN index on keywords array
CREATE INDEX IF NOT EXISTS "Opportunity_keywords_idx" 
ON "Opportunity" USING GIN (keywords);

-- GIN index on educationRequirements array
CREATE INDEX IF NOT EXISTS "Opportunity_educationRequirements_idx" 
ON "Opportunity" USING GIN ("educationRequirements");

-- GIN index on languageRequirements array
CREATE INDEX IF NOT EXISTS "Opportunity_languageRequirements_idx" 
ON "Opportunity" USING GIN ("languageRequirements");

-- =============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- =============================================================================

-- Partial index for active opportunities (most common query)
CREATE INDEX IF NOT EXISTS "Opportunity_active_idx" 
ON "Opportunity" (deadline, "primaryCategory", industry)
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL;

-- Partial index for expiring soon opportunities
CREATE INDEX IF NOT EXISTS "Opportunity_expiring_soon_idx" 
ON "Opportunity" (deadline)
WHERE status = 'EXPIRING_SOON' AND "deletedAt" IS NULL;

-- Index for search by compensation range
CREATE INDEX IF NOT EXISTS "Opportunity_compensation_idx" 
ON "Opportunity" ("compensationType", "compensationMin", "compensationMax")
WHERE "compensationType" != 'NOT_SPECIFIED';

-- Index for remote opportunities
CREATE INDEX IF NOT EXISTS "Opportunity_remote_idx" 
ON "Opportunity" ("isRemote", "primaryCategory")
WHERE "isRemote" = true AND status = 'ACTIVE';

-- =============================================================================
-- UTILITY FUNCTIONS FOR SEARCH
-- =============================================================================

-- Function for fuzzy company search with similarity score
CREATE OR REPLACE FUNCTION search_companies(search_query text, limit_count int DEFAULT 10)
RETURNS TABLE(company text, similarity_score real) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT o.company, similarity(o.company, search_query) as sim
    FROM "Opportunity" o
    WHERE o.company % search_query  -- % is the similarity operator
    ORDER BY sim DESC
    LIMIT limit_count;
END
$$ LANGUAGE plpgsql;

-- Function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_opportunities(
    search_query text,
    category_filter text DEFAULT NULL,
    limit_count int DEFAULT 20
)
RETURNS TABLE(
    id text,
    title text,
    company text,
    rank real,
    headline text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.title,
        o.company,
        ts_rank(o."searchVector", websearch_to_tsquery('english', search_query)) as rank,
        ts_headline('english', o.description, websearch_to_tsquery('english', search_query),
            'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15') as headline
    FROM "Opportunity" o
    WHERE 
        o."searchVector" @@ websearch_to_tsquery('english', search_query)
        AND o.status = 'ACTIVE'
        AND o."deletedAt" IS NULL
        AND (category_filter IS NULL OR o."primaryCategory"::text = category_filter)
    ORDER BY rank DESC
    LIMIT limit_count;
END
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BACKFILL: Update existing records to populate searchVector
-- =============================================================================

-- Update all existing opportunities to generate their search vectors
UPDATE "Opportunity" SET 
    "searchVector" = 
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(company, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE("shortDescription", '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string("skillsRequired", ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE("experienceRequired", '')), 'C') ||
        setweight(to_tsvector('english', COALESCE("locationCity", '')), 'D') ||
        setweight(to_tsvector('english', COALESCE("locationCountry", '')), 'D')
WHERE "searchVector" IS NULL;