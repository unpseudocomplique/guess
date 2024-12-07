// server/words.ts
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';

interface LexiqueEntry {
  ortho: string;
  freqLemFilms: number;
  cgram: string;
  lemme: string;
  deflem: number; // percent of persons who know the word
}

let WORDS: LexiqueEntry[] = [];

export async function loadLexique(filePath: string) {
  const data = await fs.readFile(filePath, 'utf-8');
  const records = parse(data, {
    delimiter: ',',
    columns: true,
    trim: true
  });

  // Identifier les clés correspondant à 'ortho' et 'freqlemfilms2'
  const sample = records[0];
  const orthoKey = Object.keys(sample).find(k => k.toLowerCase().includes('ortho'));
  const freqKey = Object.keys(sample).find(k => k.toLowerCase().includes('freqlemfilms2'));
  const cgramKey = Object.keys(sample).find(k => k.toLowerCase().includes('cgram'));
  const lemmeKey = Object.keys(sample).find(k => k.toLowerCase().includes('3_lemme'));
  const deflemKey = Object.keys(sample).find(k => k.toLowerCase().includes('deflem'));


  if (!orthoKey || !freqKey || !cgramKey || !lemmeKey || !deflemKey) {
    throw new Error("Impossible de trouver les colonnes ortho ou freqlemfilms2 dans le fichier.");
  }

  const allWords: LexiqueEntry[] = records.map((r: Record<string, string>) => {
    return {
      ortho: r[orthoKey],
      freqLemFilms: parseFloat(r[freqKey]) || 0,
      cgram: r[cgramKey],
      lemme: r[lemmeKey],
      deflem: parseFloat(r[deflemKey]) || 0
    };
  }).filter((w: LexiqueEntry) => {
    const withSpace = w.ortho.includes(' ');
    return w.ortho && w.ortho.length > 3 && !withSpace && w.freqLemFilms > 10 && w.deflem;
  });

  const uniqueWords = new Set(allWords.map(w => w.lemme));


  // WORDS = allWords;
  WORDS = Array.from(uniqueWords).map(w => allWords.find(w2 => w2.lemme === w)!);

  const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  console.log('randomWord', WORDS.length, randomWord)
}

// Définition de la difficulté basée sur la fréquence
function getDifficulty(word: LexiqueEntry): 'facile' | 'moyen' | 'difficile' {
  const f = word.deflem;
  if (f > 80) return 'facile';
  else if (f > 50) return 'moyen';
  else return 'difficile';
}

export function getRandomWord(difficulty: 'facile' | 'moyen' | 'difficile'): string {
  const filtered = WORDS.filter(w => getDifficulty(w) === difficulty);

  const randomWord = filtered[Math.floor(Math.random() * filtered.length)];
  return randomWord.ortho;
}

export function wordExists(word: string): boolean {
  return WORDS.some(w => w.ortho.toLowerCase() === word.toLowerCase());
}
