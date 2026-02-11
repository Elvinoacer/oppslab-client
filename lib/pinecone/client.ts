// =============================================================================
// Pinecone Client Configuration
// Singleton pattern for Pinecone connection with Prisma 7-style initialization
// =============================================================================

import { Pinecone } from "@pinecone-database/pinecone";

// Pinecone index configuration
export const PINECONE_CONFIG = {
  indexName: process.env.PINECONE_INDEX_NAME || "opportunities",
  namespace: "opportunities",
  dimension: 768, // Gemini gemini-embedding-001 dimension (truncated)
  metric: "cosine" as const,
  
  // Metadata fields stored with each vector
  metadataFields: [
    "id",
    "slug",
    "title",
    "company",
    "primaryCategory",
    "industry",
    "roleType",
    "experienceLevel",
    "workMode",
    "isRemote",
    "locationCountry",
    "locationCity",
    "deadline",
    "status",
    "compensationType",
  ] as const,
} as const;

// Global Pinecone instance (singleton pattern)
let pineconeInstance: Pinecone | null = null;

/**
 * Get or create Pinecone client instance
 * Uses singleton pattern to avoid multiple connections
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeInstance) {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "PINECONE_API_KEY environment variable is required. " +
        "Get your API key from https://app.pinecone.io/"
      );
    }
    
    pineconeInstance = new Pinecone({
      apiKey,
    });
  }
  
  return pineconeInstance;
}

/**
 * Get the opportunities index
 */
export function getOpportunitiesIndex() {
  const client = getPineconeClient();
  return client.index(PINECONE_CONFIG.indexName);
}

/**
 * Get the opportunities namespace within the index
 */
export function getOpportunitiesNamespace() {
  return getOpportunitiesIndex().namespace(PINECONE_CONFIG.namespace);
}

// Type for metadata stored with vectors
export type OpportunityVectorMetadata = {
  id: string;
  slug: string;
  title: string;
  company: string;
  primaryCategory: string;
  industry?: string;
  roleType?: string;
  experienceLevel: string;
  workMode?: string;
  isRemote: boolean;
  locationCountry?: string;
  locationCity?: string;
  deadline?: string; // ISO date string
  status: string;
  compensationType?: string;
};

// Type for vector record
export type OpportunityVector = {
  id: string;
  values: number[];
  metadata: OpportunityVectorMetadata;
};
