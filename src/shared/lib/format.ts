/** 숫자를 한국어 천 단위 표기로. 표시 규칙은 한 곳에서만 정한다(agent-rules §6). */
export function formatCount(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(n)
}
