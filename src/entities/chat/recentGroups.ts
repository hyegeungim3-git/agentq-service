/**
 * 최근 대화를 '오늘 / 어제 / 이전'으로 묶는다 — 원본 사이드바와 같은 모양.
 *
 * 목록이 길어지면 제목만으로는 언제 물어본 것인지 모른다. 원본이 날짜로 나눠 둔
 * 이유가 그것이다.
 *
 * ⚠️ **시각이 없는 대화도 버리지 않는다.** 예전에 저장해 둔 것에는 `at`이 없다 —
 * 안 보이게 하는 대신 '이전'에 둔다. 있던 대화가 사라지는 쪽이 훨씬 나쁘다.
 *
 * `now`를 인자로 받는다. 안에서 시계를 읽으면 검사가 '오늘'을 만들 수 없고,
 * 자정을 넘길 때 무슨 일이 생기는지도 확인할 수 없다.
 */

export type Grouped<T> = { label: string; items: T[] }

const startOfDay = (ms: number): number => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const DAY = 24 * 60 * 60 * 1000

export function groupByRecency<T extends { at?: number }>(items: T[], now: number): Grouped<T>[] {
  const today = startOfDay(now)
  const buckets: Record<string, T[]> = { 오늘: [], 어제: [], 이전: [] }

  for (const it of items) {
    if (it.at === undefined) {
      buckets['이전']?.push(it)
      continue
    }
    const day = startOfDay(it.at)
    /* 앞선 시각(시계가 뒤로 간 기기)도 오늘로 본다 — '미래' 묶음을 만들면
       사용자는 왜 거기 있는지 알 방법이 없다 */
    if (day >= today) buckets['오늘']?.push(it)
    else if (day >= today - DAY) buckets['어제']?.push(it)
    else buckets['이전']?.push(it)
  }

  /* 빈 묶음은 그리지 않는다 — 머리글만 있는 자리는 '아직 안 채운 칸'으로 읽힌다 */
  return Object.entries(buckets)
    .filter(([, v]) => v.length > 0)
    .map(([label, v]) => ({ label, items: v }))
}
