// =============================================================================
// Vector Operations Service
// High-level operations for managing opportunity vectors in Pinecone
// =============================================================================

import {
  getOpportunitiesNamespace,
  PINECONE_CONFIG,
  type OpportunityVectorMetadata,
} from "./client";
import {
  generateDocumentEmbedding,
  generateQueryEmbedding,
  generateBatchEmbeddings,
  prepareOpportunityText,
} from "./embeddings";

// Types for opportunity data
type OpportunityData = {
  id: string;
  slug: string;
  title: string;
  company: string;
  description: string;
  shortDescription?: string | null;
  primaryCategory: string;
  industry?: string | null;
  roleType?: string | null;
  experienceLevel: string;
  workMode?: string | null;
  isRemote: boolean;
  skillsRequired?: string[];
  locationCity?: string | null;
  locationCountry?: string | null;
  deadline?: Date | null;
  status: string;
  compensationType?: string | null;
};

// Search result type
export type VectorSearchResult = {
  id: string;
  score: number;
  metadata: OpportunityVectorMetadata;
};

// Search options
export type VectorSearchOptions = {
  topK?: number;
  filter?: Partial<{
    primaryCategory: string | { $in: string[] };
    industry: string | { $in: string[] };
    roleType: string | { $in: string[] };
    experienceLevel: string | { $in: string[] };
    workMode: string | { $in: string[] };
    isRemote: boolean;
    locationCountry: string | { $in: string[] };
    status: string;
  }>;
  includeMetadata?: boolean;
};

/**
 * Upsert a single opportunity vector to Pinecone
 */
export async function upsertOpportunityVector(
  opportunity: OpportunityData
): Promise<void> {
  const namespace = getOpportunitiesNamespace();
  
  // Prepare text and generate embedding
  const text = prepareOpportunityText(opportunity);
  const embedding = await generateDocumentEmbedding(text);
  
  // Prepare metadata
  const metadata: OpportunityVectorMetadata = {
    id: opportunity.id,
    slug: opportunity.slug,
    title: opportunity.title,
    company: opportunity.company,
    primaryCategory: opportunity.primaryCategory,
    industry: opportunity.industry ?? undefined,
    roleType: opportunity.roleType ?? undefined,
    experienceLevel: opportunity.experienceLevel,
    workMode: opportunity.workMode ?? undefined,
    isRemote: opportunity.isRemote,
    locationCountry: opportunity.locationCountry ?? undefined,
    locationCity: opportunity.locationCity ?? undefined,
    deadline: opportunity.deadline?.toISOString(),
    status: opportunity.status,
    compensationType: opportunity.compensationType ?? undefined,
  };
  
  // Upsert to Pinecone using the correct API format
  await namespace.upsert({
    records: [
      {
        id: opportunity.id,
        values: embedding,
        metadata,
      },
    ],
  });
}

/**
 * Upsert multiple opportunity vectors in batch
 */
export async function upsertOpportunityVectorsBatch(
  opportunities: OpportunityData[]
): Promise<void> {
  if (opportunities.length === 0) return;
  
  const namespace = getOpportunitiesNamespace();
  
  // Prepare texts
  const texts = opportunities.map(prepareOpportunityText);
  
  // Generate embeddings in batch
  const embeddings = await generateBatchEmbeddings(texts);
  
  // Prepare vectors
  const records = opportunities.map((opportunity, index) => ({
    id: opportunity.id,
    values: embeddings[index],
    metadata: {
      id: opportunity.id,
      slug: opportunity.slug,
      title: opportunity.title,
      company: opportunity.company,
      primaryCategory: opportunity.primaryCategory,
      industry: opportunity.industry ?? undefined,
      roleType: opportunity.roleType ?? undefined,
      experienceLevel: opportunity.experienceLevel,
      workMode: opportunity.workMode ?? undefined,
      isRemote: opportunity.isRemote,
      locationCountry: opportunity.locationCountry ?? undefined,
      locationCity: opportunity.locationCity ?? undefined,
      deadline: opportunity.deadline?.toISOString(),
      status: opportunity.status,
      compensationType: opportunity.compensationType ?? undefined,
    } as OpportunityVectorMetadata,
  }));
  
  // Upsert in batches of 100 (Pinecone limit)
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await namespace.upsert({ records: batch });
  }
}

/**
 * Delete a single opportunity vector
 */
export async function deleteOpportunityVector(id: string): Promise<void> {
  const namespace = getOpportunitiesNamespace();
  await namespace.deleteOne({ id });
}

/**
 * Delete multiple opportunity vectors
 */
export async function deleteOpportunityVectorsBatch(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  
  const namespace = getOpportunitiesNamespace();
  await namespace.deleteMany({ ids });
}

/**
 * Clear all vectors from the opportunities namespace
 */
export async function clearOpportunitiesNamespace(): Promise<void> {
  const namespace = getOpportunitiesNamespace();
  await namespace.deleteAll();
}

/**
 * Semantic search for opportunities
 */
export async function searchOpportunities(
  query: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  const {
    topK = 20,
    filter,
    includeMetadata = true,
  } = options;
  
  const namespace = getOpportunitiesNamespace();
  
  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query);
  
  // Build filter with active status by default
  const searchFilter = {
    status: "ACTIVE",
    ...filter,
  };
  
  // Query Pinecone
  const results = await namespace.query({
    vector: queryEmbedding,
    topK,
    filter: searchFilter,
    includeMetadata,
  });
  
  // Transform results
  return (results.matches || []).map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    metadata: match.metadata as OpportunityVectorMetadata,
  }));
}

/**
 * Find similar opportunities to a given opportunity
 */
export async function findSimilarOpportunities(
  opportunityId: string,
  options: Omit<VectorSearchOptions, "filter"> & {
    excludeCategories?: string[];
  } = {}
): Promise<VectorSearchResult[]> {
  const { topK = 10, excludeCategories } = options;
  
  const namespace = getOpportunitiesNamespace();
  
  // Fetch the source vector
  const fetchResult = await namespace.fetch({ ids: [opportunityId] });
  const sourceVector = fetchResult.records[opportunityId];
  
  if (!sourceVector || !sourceVector.values) {
    return [];
  }
  
  // Query for similar vectors (excluding itself)
  const filter: VectorSearchOptions["filter"] = {
    status: "ACTIVE",
  };
  
  const results = await namespace.query({
    vector: sourceVector.values,
    topK: topK + 1, // +1 to account for excluding self
    filter,
    includeMetadata: true,
  });
  
  // Filter out the source opportunity and excluded categories
  return (results.matches || [])
    .filter((match) => {
      if (match.id === opportunityId) return false;
      if (excludeCategories?.length) {
        const category = (match.metadata as OpportunityVectorMetadata)?.primaryCategory;
        if (category && excludeCategories.includes(category)) return false;
      }
      return true;
    })
    .slice(0, topK)
    .map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      metadata: match.metadata as OpportunityVectorMetadata,
    }));
}

/**
 * Get statistics about the vector index
 */
export async function getIndexStats(): Promise<{
  totalVectors: number;
  dimension: number;
}> {
  const index = getOpportunitiesNamespace();
  const stats = await index.describeIndexStats();
  
  return {
    totalVectors: stats.totalRecordCount ?? 0,
    dimension: PINECONE_CONFIG.dimension,
  };
}

/**
 * Check if an opportunity has a vector stored
 */
export async function hasVector(opportunityId: string): Promise<boolean> {
  const namespace = getOpportunitiesNamespace();
  const result = await namespace.fetch({ ids: [opportunityId] });
  return !!result.records[opportunityId];
}
