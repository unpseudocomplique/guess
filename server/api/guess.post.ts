// server/api/guess.post.ts
import { getCookie, readBody, H3Event } from 'h3'
import { wordExists } from '../words'
import { computeSimilarity } from '../model'

interface GuessRequestBody {
  guess: string;
}

interface GuessResponseSuccess {
  guess: string;
  similarity: number;
  win: boolean;
  message?: string;
}

interface GuessResponseError {
  error: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<GuessRequestBody>(event);
  const guess = body?.guess;

  if (!guess || typeof guess !== 'string') {
    return { error: 'Aucun mot fourni.' };
  }

  const cleanedGuess = guess.trim().toLowerCase();

  const targetWord = getCookie(event, 'targetWord');
  if (!targetWord) {
    return { error: 'Aucun jeu en cours. Réinitialisez le jeu via /api/init.' };
  }

  console.log('targetWord', targetWord)
  console.log('cleanedGuess', cleanedGuess)

  if (!wordExists(cleanedGuess)) {
    return { error: "Le mot n'existe pas." };
  }

  if (cleanedGuess === targetWord.toLowerCase()) {
    return {
      guess: cleanedGuess,
      similarity: 1.0,
      win: true,
      message: "Félicitations ! Vous avez trouvé le mot."
    };
  }

  const similarity = await computeSimilarity(cleanedGuess, targetWord);

  console.log('similarity', similarity)

  return {
    guess: cleanedGuess,
    similarity,
    win: false
  };
});
