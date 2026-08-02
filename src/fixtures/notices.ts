/**
 * 공지 fixture — 다른 fixture와 같은 세계관(한빛정밀 2026년 3월)이다.
 * '필독' 하나를 섞었다. 전부 같은 등급이면 등급 표시가 죽은 코드가 된다.
 */
import type { Notice } from '@entities/notice/model'

export const NOTICES: Notice[] = [
  {
    id: 'nt-1',
    level: 'important',
    title: '2026년 1분기 보안 업데이트 — 비밀번호 변경 필요',
    postedOn: '2026-02-25',
    body: '3월 6일까지 사내 시스템 비밀번호를 변경해 주십시오. 기한이 지나면 AI 플랫폼 접속이 제한됩니다. 변경은 사내 포털 계정 관리에서 할 수 있습니다.',
  },
  {
    id: 'nt-2',
    level: 'notice',
    title: 'PRS-C03 진동 관리 기준 하향 (4.5 → 3.5mm/s)',
    postedOn: '2026-03-20',
    body: '3월 3주 공정회의 결정에 따라 프레스 진동 관리 기준을 3.5mm/s로 내립니다. 3월 20일부터 적용하며, 기준 초과 시 운전을 계속하지 말고 보전팀 진단을 받으십시오.',
  },
  {
    id: 'nt-3',
    level: 'notice',
    title: '금형 교체 체크리스트 개정 예정',
    postedOn: '2026-03-21',
    body: '초품 검사 기록 항목을 체크리스트에 추가합니다. 담당과 확정 일자는 아직 정해지지 않았으며, 확정되면 다시 공지합니다.',
  },
]
