// server/api/init.get.ts
import { setCookie, H3Event, getQuery } from 'h3'
import { getRandomWord } from '../words'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event);
  const difficulty = (query.difficulty as string) || 'facile';

  // On récupère un mot selon la difficulté
  const randomWord = getRandomWord(
    ['facile', 'moyen', 'difficile'].includes(difficulty) ? (difficulty as 'facile'|'moyen'|'difficile') : 'facile'
  );

  setCookie(event, 'targetWord', randomWord, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600
  });

  return { message: 'Jeu initialisé', difficulty, debugTarget: randomWord };
});
