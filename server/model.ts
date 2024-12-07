// server/model.ts
import { pipeline, cos_sim } from '@xenova/transformers';

let extractor: any = null;

// Chargement lazy du pipeline
export async function loadExtractor() {
  if (!extractor) {
    // Charge le pipeline de feature-extraction
    // Le modèle "mixedbread-ai/mxbai-embed-large-v1" est un modèle d'embeddings multilingue
    extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-mpnet-base-v2', {
      quantized: false 
    });
  }
  return extractor;
}

export async function getEmbeddingForWord(word: string): Promise<number[]> {
  const extractor = await loadExtractor();
  // On passe un tableau avec un seul mot pour obtenir un embedding
  const embeddings = await extractor([word], { pooling: 'cls' });
  
  // embeddings est un tensor-like object, on convertit en tableau
  const embedding = embeddings.tolist()[0]; 
  // embedding est maintenant un tableau 1D représentant le mot
  return embedding;
}

export async function computeSimilarity(wordA: string, wordB: string): Promise<number> {
  const vecA = await getEmbeddingForWord(wordA);
  const vecB = await getEmbeddingForWord(wordB);
  const similarity = cos_sim(vecA, vecB);
  return similarity;
}
