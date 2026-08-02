/**
 * 회의록 fixture.
 *
 * 조치 항목 중 하나는 담당자가, 하나는 기한이 비어 있다.
 * 회의에서 안 정해진 것을 AI가 채우면 안 되고, 화면은 그 빈칸을 드러내야 한다.
 * 전부 채워 두면 '미정 표시'가 죽은 코드가 된다.
 */
import type { MeetingRequest, MeetingResult } from '@entities/meeting/model'

const BASE = {
  title: '3월 3주 공정회의',
  heldOn: '2026-03-20',
  place: '창원본사 3층 회의실',
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
    { id: 'd-1', text: 'PRS-C03 진동 관리 기준을 4.5mm/s에서 3.5mm/s로 하향하고 3월 20일부터 적용한다.', basis: null },
    { id: 'd-2', text: '금형 교체 체크리스트에 초품 검사 기록 항목을 추가한다.', basis: null },
    { id: 'd-3', text: '침탄로 3호기 후단존 편차는 열전대 재교정만으로 해소되지 않아 근본 조치를 검토한다.', basis: null },
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

/**
 * 회의 자료가 뒷받침하는 결정.
 * 자료를 붙이지 않으면 근거가 없는 것이고, 그건 감출 일이 아니라 표시할 일이다.
 */
const BASIS_BY_REFERENCE: Record<string, { decisionId: string; cite: string }[]> = {
  'doc-press-sop': [
    { decisionId: 'd-1', cite: '프레스_작업표준서_SOP-PR-011.pdf 제5장 이상 대응' },
    { decisionId: 'd-2', cite: '프레스_작업표준서_SOP-PR-011.pdf 제3장 금형 교체' },
  ],
  'doc-quality-report': [
    { decisionId: 'd-3', cite: '2026년_1분기_품질동향조사.pdf 4. 개선 과제' },
  ],
}

const REFERENCE_NAME: Record<string, string> = {
  'doc-press-sop': '프레스_작업표준서_SOP-PR-011.pdf',
  'doc-quality-report': '2026년_1분기_품질동향조사.pdf',
  'doc-inspection-cert': '수입검사성적서_SPCC-2211.pdf',
}

/** 기본 예시 — 명단에는 있지만 발언이 없는 사람과, 논의되지 않은 안건을 일부러 넣었다 */
export const ATTENDEE_SAMPLE = ['박태윤,생산기술팀', '한지민,품질관리부', '김도현,설비보전팀', '이서준,생산관리팀'].join('\n')
export const AGENDA_SAMPLE = ['PRS-C03 진동 관리 기준', '금형 교체 체크리스트', '설비 투자 계획'].join('\n')

const lines = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

/** '이름,부서' 또는 '이름' */
const attendeeName = (line: string): string => (line.split(',')[0] ?? '').trim()

/** 설정을 반영한 회의록 — 서버가 붙으면 이 함수가 사라진다 */
export function simulateMinutes(req: MeetingRequest): MeetingResult {
  const cites = new Map<string, string>()
  for (const id of req.referenceIds) {
    for (const b of BASIS_BY_REFERENCE[id] ?? []) cites.set(b.decisionId, b.cite)
  }

  const decisions = BASE.decisions.map((d) => ({ ...d, basis: cites.get(d.id) ?? null }))

  const listed = lines(req.inputs.attendees).map(attendeeName)
  const spoken = [...new Set(BASE.utterances.map((u) => u.speakerId))].map(
    (id) => BASE.speakers.find((s) => s.id === id)?.name ?? '미상',
  )
  const attendance =
    listed.length === 0
      ? null
      : {
          spoke: listed.filter((n) => spoken.includes(n)),
          silent: listed.filter((n) => !spoken.includes(n)),
          unlisted: spoken.filter((n) => !listed.includes(n)),
        }

  /* 안건과 결정을 말로 잇는다. 붙지 않은 안건은 '논의되지 않음'이고,
     그걸 드러내는 것이 회의록의 실무 가치다. */
  const agendaCoverage = lines(req.inputs.agenda).map((topic, i) => {
    const keys = topic.split(/\s+/).filter((t) => t.length >= 2)
    return {
      no: i + 1,
      topic,
      decisionIds: decisions.filter((d) => keys.some((k) => d.text.includes(k))).map((d) => d.id),
    }
  })

  const hasHeader = req.inputs.title.trim().length > 0 || req.inputs.heldOn.trim().length > 0

  return {
    documentId: req.documentId,
    title: req.inputs.title.trim() || BASE.title,
    heldOn: req.inputs.heldOn.trim() || BASE.heldOn,
    place: req.inputs.place.trim() || BASE.place,
    headerSource: hasHeader ? 'input' : 'estimated',
    references: req.referenceIds.map((id) => REFERENCE_NAME[id] ?? id),
    attendance,
    agendaCoverage,
    speakers: BASE.speakers,
    utterances: req.includeUtterances ? BASE.utterances : [],
    decisions,
    actionItems: BASE.actionItems,
    // 자료를 읽고 안건을 대조하는 만큼 더 걸린다
    elapsedSeconds:
      Math.round((BASE.elapsedSeconds + req.referenceIds.length * 1.4 + agendaCoverage.length * 0.3) * 10) / 10,
  }
}
