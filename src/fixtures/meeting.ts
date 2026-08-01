/**
 * 회의록 fixture.
 *
 * 조치 항목 중 하나는 담당자가, 하나는 기한이 비어 있다.
 * 회의에서 안 정해진 것을 AI가 채우면 안 되고, 화면은 그 빈칸을 드러내야 한다.
 * 전부 채워 두면 '미정 표시'가 죽은 코드가 된다.
 */
import type { MeetingResult } from '@entities/meeting/model'

export const MEETING_RESULT: MeetingResult = {
  documentId: 'doc-meeting-0320',
  title: '3월 3주 공정회의',
  heldOn: '2026-03-20',
  elapsedSeconds: 11.6,
  speakers: [
    { id: 'sp-1', name: '박태윤', dept: '생산기술팀' },
    { id: 'sp-2', name: '한지민', dept: '품질관리부' },
    { id: 'sp-3', name: '김도현', dept: '설비보전팀' },
  ],
  utterances: [
    {
      speakerId: 'sp-3',
      atSeconds: 42,
      text: 'PRS-C03 진동이 계속 올라옵니다. 현재 관리 기준이 4.5mm/s인데 실제로는 4.2에서도 이상 징후가 보입니다.',
    },
    {
      speakerId: 'sp-1',
      atSeconds: 118,
      text: '기준을 3.5로 내리면 지금 알람이 잡혔을 겁니다. 이번 주부터 적용하죠.',
    },
    {
      speakerId: 'sp-2',
      atSeconds: 205,
      text: '금형 교체 후 초품 검사 기록이 설비 대장에 안 남는 경우가 있습니다. 표준에는 있는데 실행이 빠집니다.',
    },
    {
      speakerId: 'sp-1',
      atSeconds: 260,
      text: '교체 작업 체크리스트에 기록 항목을 넣겠습니다. 담당은 다음 주에 정하죠.',
    },
    {
      speakerId: 'sp-3',
      atSeconds: 331,
      text: '침탄로 3호기 후단존 편차는 열전대 재교정으로 -7.8에서 -6.9까지 왔습니다. 아직 한계 밖입니다.',
    },
  ],
  decisions: [
    { id: 'd-1', text: 'PRS-C03 진동 관리 기준을 4.5mm/s에서 3.5mm/s로 하향하고 3월 20일부터 적용한다.' },
    { id: 'd-2', text: '금형 교체 체크리스트에 초품 검사 기록 항목을 추가한다.' },
    { id: 'd-3', text: '침탄로 3호기 후단존 편차는 열전대 재교정만으로 해소되지 않아 근본 조치를 검토한다.' },
  ],
  actionItems: [
    {
      id: 'a-1',
      task: 'PdM 알람 임계치를 3.5mm/s로 변경',
      ownerId: 'sp-3',
      due: '2026-03-20',
    },
    {
      id: 'a-2',
      // 회의에서 "다음 주에 정하죠"로 끝난 항목 — 담당자를 임의로 채우지 않는다
      task: '금형 교체 체크리스트 개정',
      ownerId: null,
      due: '2026-03-27',
    },
    {
      id: 'a-3',
      task: '침탄로 3호기 후단존 근본 조치안 수립',
      ownerId: 'sp-1',
      due: null,
    },
  ],
}
