/**
 * 라이브 지표 모델 — 지금 값이 어디까지 왔는지.
 *
 * ⚠️ 이 값은 **실측이 아니다.** 서버가 없으므로 예시 곡선을 시간에 따라 재생한다.
 * 그래서 화면이 반드시 '예시 값'이라고 말해야 한다. 계기판처럼 보이는데 지어낸
 * 숫자면 그게 제일 위험하다.
 *
 * 진행량은 **벽시계 경과 × 배속**으로 계산한다. 틱 횟수로 세면 안 된다 —
 * 브라우저는 백그라운드 탭의 타이머를 수십 초 단위로 늦춘다. 틱을 세면 탭을
 * 돌아왔을 때 값이 멈춰 있고, 그걸 앱 버그로 오해하게 된다.
 */

export type MetricSpeed = 1 | 10 | 60

export type LiveMetric = {
  id: string
  label: string
  unit: string
  /** 관리 기준 — 넘으면 조치가 필요하다 */
  threshold: number
  /** 재생할 예시 곡선. 초 단위 간격으로 이어진다 */
  curve: number[]
  /** 곡선 한 점이 나타내는 실제 시간(초) */
  stepSeconds: number
  source: string
}

export const METRIC_SPEEDS: MetricSpeed[] = [1, 10, 60]

/**
 * 시작 이후 흐른 벽시계 시간(ms)과 배속으로 지금 값을 구한다.
 * 곡선 끝에 닿으면 마지막 값을 유지한다 — 되감아 반복하면 오르내리는 것처럼 보인다.
 */
export function valueAt(metric: LiveMetric, elapsedMs: number, speed: MetricSpeed): number {
  const simulatedSeconds = (elapsedMs / 1000) * speed
  const idx = simulatedSeconds / metric.stepSeconds
  const last = metric.curve.length - 1
  if (idx >= last) return metric.curve[last] ?? 0
  const i = Math.floor(idx)
  const a = metric.curve[i] ?? 0
  const b = metric.curve[i + 1] ?? a
  // 점 사이는 이어서 보여 준다 — 계단으로 뛰면 값이 튀는 것처럼 읽힌다
  return a + (b - a) * (idx - i)
}

/** 곡선이 끝까지 재생됐는가 */
export function isFinished(metric: LiveMetric, elapsedMs: number, speed: MetricSpeed): boolean {
  const simulatedSeconds = (elapsedMs / 1000) * speed
  return simulatedSeconds / metric.stepSeconds >= metric.curve.length - 1
}

export const exceeds = (metric: LiveMetric, value: number): boolean => value > metric.threshold
