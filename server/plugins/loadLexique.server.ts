import { loadLexique } from '../words';

export default async () => {
  await loadLexique(`${process.cwd()}/server/dictionary/Lexique383.csv`);
};