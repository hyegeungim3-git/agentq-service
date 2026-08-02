/**
 * 라이브 지표 fixture.
 *
 * 세계관은 다른 fixture와 같다 — PRS-C03 진동이 관리 기준 3.5mm/s를 넘어 4.2까지
 * 올라간 그 사건이다. 알림 센터의 첫 신호, 오케스트레이션의 1단계, 회의록의 결정이
 * 모두 이 수치를 가리킨다. 지표가 다른 숫자를 말하면 한 이야기가 아니게 된다.
 *
 * 곡선은 기준 아래에서 시작해 넘어간다. 처음부터 넘어 있으면
 * '넘는 순간'을 보여 주는 화면이 죽은 코드가 된다.
 */
import type { LiveMetric } from '@entities/metric/model'

export const PRESS_VIBRATION: LiveMetric = {
  id: 'm-prs-c03-vib',
  label: 'PRS-C03 진동 RMS',
  unit: 'mm/s',
  threshold: 3.5,
  /* 1분 간격 관측값 — 3.1에서 시작해 4.2까지.
     간격을 크게 잡으면 1배속에서 아무 움직임도 안 보인다.
     전체 9분이라 1배속으로도 변화가 보이고, 60배속이면 9초에 끝난다. */
  stepSeconds: 60,
  curve: [3.1, 3.2, 3.3, 3.45, 3.6, 3.8, 3.95, 4.05, 4.15, 4.2],
  source: 'PdM 진동 수집기 (창원본사 3번 프레스)',
}
