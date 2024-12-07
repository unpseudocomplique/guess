// server/words.ts
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';

interface LexiqueEntry {
  ortho: string;
  freqLemFilms: number;
  cgram: string;
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

  if (!orthoKey || !freqKey || !cgramKey) {
    throw new Error("Impossible de trouver les colonnes ortho ou freqlemfilms2 dans le fichier.");
  }

  const cgramInluded = ['NOM', 'ADJ']

  const allWords: LexiqueEntry[] = records.map((r: Record<string,string>) => {
    return {
      ortho: r[orthoKey],
      freqLemFilms: parseFloat(r[freqKey]) || 0,
      cgram: r[cgramKey]
    };
  }).filter((w: LexiqueEntry) => {
    const withSpace = w.ortho.includes(' ');
    return w.ortho && w.ortho.length > 3 && !withSpace && w.freqLemFilms > 10 && cgramInluded.includes(w.cgram);
  });

  const uniqueWords = new Set(allWords.map(w => w.ortho));

  
  // WORDS = allWords;
  WORDS = Array.from(uniqueWords).map(w => allWords.find(w2 => w2.ortho === w)!);
  
  const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  console.log('randomWord',WORDS.length, randomWord)
}

// Définition de la difficulté basée sur la fréquence
function getDifficulty(word: LexiqueEntry): 'facile' | 'moyen' | 'difficile' {
  const f = word.freqLemFilms;
  if (f > 1000) return 'facile';
  else if (f > 500) return 'moyen';
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
