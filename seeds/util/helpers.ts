import { movieIds } from './tmdbIds';

export function pickItem(rngNo: number, list: any[] = movieIds) {
  const index = Math.floor(list.length * rngNo);
  return list[index];
}
