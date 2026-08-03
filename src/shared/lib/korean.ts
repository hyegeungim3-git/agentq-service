/**
 * 한국어 조사 선택.
 *
 * '업무 문서이(가) 없어'처럼 괄호로 얼버무리면 화면이 급하게 만든 것처럼 읽힌다.
 * 앞 글자의 받침을 보고 고른다 — 이름이 데이터에서 오므로 문장에 박아 둘 수 없다.
 *
 * 한글이 아닌 글자로 끝나면(영문·숫자·기호) 판정할 수 없으므로 기본형을 쓴다.
 * 잘못 붙이느니 무난한 쪽을 택한다.
 */

const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3

/** 마지막 글자에 받침이 있는가. 한글이 아니면 null */
export function hasFinalConsonant(word: string): boolean | null {
  const last = word.trim().at(-1)
  if (last === undefined) return null
  const code = last.charCodeAt(0)
  if (code < HANGUL_START || code > HANGUL_END) return null
  return (code - HANGUL_START) % 28 !== 0
}

function pick(word: string, withFinal: string, withoutFinal: string): string {
  const has = hasFinalConsonant(word)
  return has === null ? withoutFinal : has ? withFinal : withoutFinal
}

/** 이/가 */
export const subjectParticle = (word: string): string => pick(word, '이', '가')
/** 은/는 */
export const topicParticle = (word: string): string => pick(word, '은', '는')
/** 을/를 */
export const objectParticle = (word: string): string => pick(word, '을', '를')

/** '업무 문서가', '조직 정보가'처럼 붙여 준다 */
export const withSubject = (word: string): string => `${word}${subjectParticle(word)}`
