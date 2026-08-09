import { useEffect, useRef, useState } from 'react'
import {
  exceeds,
  isFinished,
  valueAt,
  type LiveMetric,
  type MetricSpeed,
} from '@entities/metric/model'

/**
 * 라이브 지표 재생.
 *
 * 진행량을 **벽시계 경과 × 배속**으로 구한다. 틱 횟수로 세면 안 된다 —
 * 브라우저는 백그라운드 탭의 타이머를 수십 초 단위로 늦추므로, 탭을 돌아왔을 때
 * 값이 멈춰 있게 된다. 이전 프로젝트에서 이것을 앱 버그로 오판한 적이 있다.
 *
 * 배속을 바꾸면 지금 값을 유지한 채 이어 가야 한다. 시작 시각을 그대로 두면
 * 배속만 바뀌어도 값이 껑충 뛴다.
 *
 * **멈출 수 있어야 한다.** 스스로 5초 넘게 움직이는 것은 멈추거나 숨길 방법을 줘야
 * 한다(WCAG 2.2.2). 움직이는 숫자 옆에서 글을 읽는 것이 어려운 사람이 있고,
 * 화면을 확대해 쓰는 사람은 값이 바뀔 때마다 초점을 잃는다.
 *
 * 배속에 0을 넣지 않고 따로 둔다 — 배속 환산식이 0으로 나누게 된다.
 */
export function useLiveMetric(metric: LiveMetric | null, tickMs = 1000) {
  const [speed, setSpeedState] = useState<MetricSpeed>(1)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  /* 시뮬레이션 시각의 기준점 — 배속을 바꿔도 값이 튀지 않게 다시 잡는다.
     0으로 두고 effect에서 채운다. 렌더 중 Date.now()를 부르면 순수성 규칙에 걸리고,
     실제로도 렌더가 몇 번 도느냐에 따라 시작 시각이 달라진다. */
  const startedAt = useRef(0)
  const carriedMs = useRef(0)

  useEffect(() => {
    /* 멈춘 동안에는 틱 자체를 안 돌린다. 돌려 놓고 값만 안 바꾸면
       배터리와 CPU를 그냥 쓴다 */
    if (paused) return
    startedAt.current = Date.now()
    const id = window.setInterval(() => {
      setElapsed(carriedMs.current + (Date.now() - startedAt.current))
    }, tickMs)
    return () => window.clearInterval(id)
  }, [tickMs, paused])

  const setSpeed = (next: MetricSpeed) => {
    if (next === speed) return
    // 지금까지의 진행을 '1배속 환산'으로 접어 두고 기준점을 다시 잡는다
    const now = Date.now()
    const base = startedAt.current || now
    const realSoFar = carriedMs.current + (now - base)
    carriedMs.current = (realSoFar * speed) / next
    startedAt.current = now
    setSpeedState(next)
  }

  /** 멈추면 지금까지의 진행을 접어 둔다 — 다시 켜면 그 자리에서 이어 간다 */
  const togglePause = () => {
    if (!paused) {
      const now = Date.now()
      carriedMs.current += now - (startedAt.current || now)
    }
    setPaused((v) => !v)
  }

  const reset = () => {
    carriedMs.current = 0
    startedAt.current = Date.now()
    setElapsed(0)
  }

  const value = metric ? valueAt(metric, elapsed, speed) : 0

  return {
    speed,
    setSpeed,
    paused,
    togglePause,
    reset,
    value,
    over: metric ? exceeds(metric, value) : false,
    finished: metric ? isFinished(metric, elapsed, speed) : false,
    elapsedMs: elapsed,
  }
}
