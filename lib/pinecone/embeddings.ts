// =============================================================================
// Embedding Generation Service
// Uses Google Gemini models for vector generation
// =============================================================================

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

// Embedding model configuration
export const EMBEDDING_CONFIG = {
  model: "models/gemini-embedding-001", // The available model
  dimension: 768,                        // Truncated dimension
} as const;

// Global Gemini instance (singleton)
let genAIInstance: GoogleGenerativeAI | null = null;

/**
 * Get or create Gemini AI client instance
 */
function getGenAIClient(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is required. " +
        "Get your API key from https://makersuite.google.com/app/apikey"
      );
    }
    
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  
  return genAIInstance;
}

/**
 * Generate embedding for a single text
 * Used for search queries
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_CONFIG.model });
  
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_QUERY,
    // @ts-ignore - Supported by API but missing in types
    outputDimensionality: EMBEDDING_CONFIG.dimension,
  });
  
  return result.embedding.values;
}

/**
 * Generate embedding for document content
 * Used when indexing opportunities
 */
export async function generateDocumentEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_CONFIG.model });
  
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    // @ts-ignore - Supported by API but missing in types
    outputDimensionality: EMBEDDING_CONFIG.dimension,
  });
  
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple documents in batch
 * More efficient for bulk operations
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_CONFIG.model });
  
  // Process in parallel with rate limiting
  const batchSize = 10;
  const results: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    // Note: embedContent doesn't support batching directly for truncation in the same way 
    // batchEmbedContents does, but batchEmbedContents might not support outputDimensionality in older SDKs.
    // The safest way is to map individual calls or use batchEmbedContents if supported.
    // Let's use individual calls similar to original implementation but with outputDimensionality.
    
    const embeddings = await Promise.all(
      batch.map(async (text) => {
        const result = await model.embedContent({
          content: { parts: [{ text }], role: "user" },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          // @ts-ignore - Supported by API but missing in types
          outputDimensionality: EMBEDDING_CONFIG.dimension,
        });
        return result.embedding.values;
      })
    );
    
    results.push(...embeddings);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Prepare opportunity text for embedding
 * Combines relevant fields with appropriate weighting
 */
export function prepareOpportunityText(opportunity: {
  title: string;
  company: string;
  description: string;
  shortDescription?: string | null;
  skillsRequired?: string[];
  industry?: string | null;
  roleType?: string | null;
  experienceLevel?: string;
  locationCity?: string | null;
  locationCountry?: string | null;
}): string {
  const parts: string[] = [];
  
  // High weight: Title and company (repeated for emphasis)
  parts.push(`Title: ${opportunity.title}`);
  parts.push(`Company: ${opportunity.company}`);
  
  // Medium weight: Short description and skills
  if (opportunity.shortDescription) {
    parts.push(`Summary: ${opportunity.shortDescription}`);
  }
  
  if (opportunity.skillsRequired?.length) {
    parts.push(`Skills: ${opportunity.skillsRequired.join(", ")}`);
  }
  
  // Context: Industry, role, experience
  if (opportunity.industry) {
    parts.push(`Industry: ${opportunity.industry}`);
  }
  
  if (opportunity.roleType) {
    parts.push(`Role: ${opportunity.roleType}`);
  }
  
  if (opportunity.experienceLevel) {
    parts.push(`Experience Level: ${opportunity.experienceLevel}`);
  }
  
  // Location
  const location = [opportunity.locationCity, opportunity.locationCountry]
    .filter(Boolean)
    .join(", ");
  if (location) {
    parts.push(`Location: ${location}`);
  }
  
  // Full description (truncated to avoid token limits)
  const maxDescLength = 2000;
  const truncatedDesc = opportunity.description.length > maxDescLength
    ? opportunity.description.slice(0, maxDescLength) + "..."
    : opportunity.description;
  parts.push(`Description: ${truncatedDesc}`);
  
  return parts.join("\n\n");
}
