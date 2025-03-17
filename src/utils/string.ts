const articles = ['a', 'an', 'the']
const conjunctions = ['and', 'but', 'or', 'nor', 'for', 'so', 'yet']
const prepositions = [
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'like',
  'near',
  'of',
  'off',
  'on',
  'onto',
  'out',
  'over',
  'past',
  'per',
  'than',
  'to',
  'up',
  'upon',
  'via',
  'with',
  'within',
]

const ignoreWords = new Set([...articles, ...conjunctions, ...prepositions])
const acronyms = ['ai', 'vs']

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index, arr) =>
      acronyms.includes(word)
        ? word.toUpperCase()
        : index === 0 || index === arr.length - 1 || !ignoreWords.has(word)
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word,
    )
    .join(' ')
}
