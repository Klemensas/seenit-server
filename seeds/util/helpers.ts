import { movieIds } from './tmdbIds';
import placeholdeWordList from './placeholdeWordList';

export function pickItem(rngNo: number, list: any[] = movieIds) {
  const index = Math.floor(list.length * rngNo);
  return list[index];
}

export function pickFromInterval(rngNo: number, interval: [number, number]) {
  const intervalNo = interval[1] - interval[0];
  return interval[0] + Math.round(intervalNo * rngNo);
}

export const generatePlaceholder = {
  sentence: (rngFn: Function, wordCount: [number, number] = [5, 10], wordList = placeholdeWordList) =>
    Array.from(
      { length: pickFromInterval(rngFn(), wordCount) },
      () => pickItem(rngFn(), wordList),
    ).join(' ') + '.'
  ,
  paragraph: (rngFn: Function, sentenceCount: [number, number] = [10, 20]) =>
    Array.from(
      { length: pickFromInterval(rngFn(), sentenceCount)  },
      () => generatePlaceholder.sentence(rngFn)
    ).join(' ')
  ,
  text: (rngFn: Function, paragraphCount: [number, number] = [3, 12]) =>
    Array.from(
      { length: pickFromInterval(rngFn(), paragraphCount)  },
      () => generatePlaceholder.paragraph(rngFn)
    ).join('\n')
  ,
};
