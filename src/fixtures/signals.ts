/**
 * 업무 신호 fixture.
 *
 * 이전 데모 사이드바의 알림 4건을 그대로 옮기되, **처리할 화면으로 이어지게** 했다.
 * 알림을 눌러도 아무 데도 못 가면 '읽음 처리 버튼'일 뿐이다.
 *
 * 세계관은 다른 fixture와 같다 — PRS-C03 진동 4.2mm/s(관리 기준 3.5),
 * 수입검사성적서 SPCC-2211, 브래킷 M-318 신규 설계.
 * 신호를 눌러 열리는 화면에서 같은 수치가 나와야 한 이야기가 된다.
 */
import type { WorkSignal } from '@entities/signal/model'

export const SIGNALS: WorkSignal[] = [
  {
    id: 'sg-vib',
    at: '2026-03-20T07:12:00',
    title: 'PRS-C03 진동 관리 기준 초과',
    detail:
      '창원본사 3번 프레스 진동 RMS 4.2mm/s로 관리 기준 3.5mm/s를 연속 초과했습니다. 운전을 계속하지 말고 보전 진단을 받아야 합니다.',
    severity: 'action',
    source: 'PdM 센서 알람',
    link: { kind: 'agent', agentId: 'dbquery', label: '설비 이력 조회' },
  },
  {
    id: 'sg-cert',
    at: '2026-03-20T09:40:00',
    title: '협력사 검사성적서 입고',
    detail:
      '대성정밀공업 수입검사성적서 SPCC-2211 스캔본 1건이 접수됐습니다. 인식 → 주소 표준화 → 이력 조회 → 보고서까지 한 번에 처리할 수 있습니다.',
    severity: 'action',
    source: '문서 접수함',
    link: { kind: 'scenario', label: '접수 처리 릴레이 열기' },
  },
  {
    id: 'sg-draw',
    at: '2026-03-19T16:05:00',
    title: '신규 설계 사양 접수 — 브래킷 M-318',
    detail:
      '유사 도면을 먼저 찾아 재사용할 요소가 있는지 확인하십시오. 축적 도면 12,400장에서 검색합니다.',
    severity: 'watch',
    source: '설계 요청 대장',
    link: { kind: 'agent', agentId: 'knowledge', label: '유사 도면 검색' },
  },
  {
    id: 'sg-max',
    at: '2026-03-18T11:00:00',
    title: 'M.AX 1단계 우선과제 검토 요청',
    detail: '발굴 과제 27건 중 1단계 대상 선정이 필요합니다. 회의는 이번 주 금요일입니다.',
    severity: 'info',
    source: '추진 TF 공유',
    link: null,
  },
]
