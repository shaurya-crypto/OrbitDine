export async function generateTextEmbedding(text: string): Promise<number[]> {
  // This is an abstract provider architecture.
  // In a real production environment, this would call OpenAI's text-embedding-ada-002
  // or Google Gemini's embedding API.
  
  // For the sake of the foundation implementation without requiring a paid API key,
  // we will generate a deterministic mock 1536-dimensional vector based on the string hash.
  
  const vector = new Array(1536).fill(0);
  
  if (!text) return vector;

  // Simple pseudo-random distribution based on string characters
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; 
  }
  
  // Seed the vector deterministically
  for (let i = 0; i < 1536; i++) {
    vector[i] = Math.sin(hash + i) * 0.1; 
  }
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < 1536; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
