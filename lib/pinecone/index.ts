// =============================================================================
// Pinecone Vector Database Module
// Export all vector-related functionality
// =============================================================================

// Client and configuration
export {
  getPineconeClient,
  getOpportunitiesIndex,
  getOpportunitiesNamespace,
  PINECONE_CONFIG,
  type OpportunityVectorMetadata,
  type OpportunityVector,
} from "./client";

// Embedding generation
export {
  generateQueryEmbedding,
  generateDocumentEmbedding,
  generateBatchEmbeddings,
  prepareOpportunityText,
  EMBEDDING_CONFIG,
} from "./embeddings";

// Vector operations
export {
  upsertOpportunityVector,
  upsertOpportunityVectorsBatch,
  deleteOpportunityVector,
  deleteOpportunityVectorsBatch,
  searchOpportunities,
  findSimilarOpportunities,
  getIndexStats,
  hasVector,
  type VectorSearchResult,
  type VectorSearchOptions,
} from "./operations";
