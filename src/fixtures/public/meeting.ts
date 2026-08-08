/**
 * 공공(한국부동산원) 회의록.
 *
 * 대상은 **3월 4주 공시가격 심의회**다. 문서 팩의 녹음 파일과 같은 회의이고,
 * 거기서 논의했다고 적어 둔 세 가지(이의신청 기한, 가격 균형 협의, 실거래 8건)를
 * 그대로 다룬다 — 두 화면이 한 이야기를 한다.
 *
 * 제조 팩과 같은 규칙:
 *  ① 조치 항목 하나는 **담당자가**, 하나는 **기한이** 비어 있다.
 *     회의에서 안 정해진 것을 AI가 채우면 안 되고, 화면은 그 빈칸을 드러내야 한다.
 *  ② 명단에 있는데 발언이 없는 사람과, 논의되지 않은 안건을 일부러 넣는다.
 */
import { makeMeetingSimulator, type MeetingCorpus } from '../meeting'

const BASE = {
  docNo: 'KREA-부동산평가처-2026-031',
  title: '3월 4주 공시가격 심의회',
  heldOn: '2026-03-24',
  place: '본원 3층 중회의실',
  elapsedSeconds: 12.4,
  speakers: [
    { id: 'rs-1', name: '김민준', dept: '부동산공시처' },
    { id: 'rs-2', name: '윤서경', dept: '토지공시부' },
    { id: 'rs-3', name: '정하윤', dept: '주택공시부' },
  ],
  utterances: [
    {
      speakerId: 'rs-2',
      atSeconds: 55,
      text: '미처리 이의신청이 18건 남았습니다. 이 중 5건은 접수 27일째라 기한까지 사흘입니다.',
    },
    {
      speakerId: 'rs-1',
      atSeconds: 132,
      text: '재조사 2건은 위원회 재심의 일정이 먼저 잡혀야 합니다. 이번 주 안에 상정하죠.',
    },
    {
      speakerId: 'rs-3',
      atSeconds: 244,
      text: '경계 표준지 협의 기준이 현행 500미터·3%포인트인데, 실제로는 그 밖에서도 차이가 큽니다.',
    },
    {
      speakerId: 'rs-1',
      atSeconds: 300,
      text: '기준 조정은 검토가 필요합니다. 담당은 다음 주에 정하죠.',
    },
    {
      speakerId: 'rs-2',
      atSeconds: 388,
      text: '실거래 의심 8건 중 3건은 지자체 통보를 마쳤고, 5건은 자금조달계획서 회신을 기다립니다.',
    },
  ],
  decisions: [
    {
      id: 'rd-1',
      text: '재조사 중인 이의신청 2건을 이번 주 위원회에 상정하고, 기한 내 처리가 어려우면 지연 사유를 서면 안내한다.',
      basis: null,
    },
    {
      id: 'rd-2',
      text: '경계 표준지 가격 균형 협의 기준(거리·변동률 차이) 조정을 검토한다.',
      basis: null,
    },
    {
      id: 'rd-3',
      text: '실거래 의심 거래 5건의 자금조달계획서 회신 기한을 4월 20일로 명시해 재발송한다.',
      basis: null,
    },
  ],
  actionItems: [
    {
      id: 'ra-1',
      task: '위원회 재심의 안건 상정 (이의신청 2건)',
      ownerId: 'rs-2',
      due: '2026-03-27',
    },
    {
      id: 'ra-2',
      // 회의에서 "다음 주에 정하죠"로 끝난 항목 — 담당자를 임의로 채우지 않는다
      task: '가격 균형 협의 기준 조정안 마련',
      ownerId: null,
      due: '2026-04-03',
    },
    {
      id: 'ra-3',
      task: '자금조달계획서 요구서 재발송',
      ownerId: 'rs-1',
      due: null,
    },
  ],
}

const BASIS: Record<string, { decisionId: string; cite: string }[]> = {
  'doc-reb-guide': [
    { decisionId: 'rd-1', cite: '표준지공시지가_조사지침_2026.pdf 제5장 이의신청 처리' },
    { decisionId: 'rd-2', cite: '표준지공시지가_조사지침_2026.pdf 제3장 가격 균형 협의' },
  ],
  'doc-reb-verify': [
    { decisionId: 'rd-3', cite: '실거래신고_검증결과서_RTMS-2026-0412.pdf' },
  ],
}

const REFERENCE_NAME: Record<string, string> = {
  'doc-reb-guide': '표준지공시지가_조사지침_2026.pdf',
  'doc-reb-market': '2026년_1분기_부동산시장동향조사.pdf',
  'doc-reb-verify': '실거래신고_검증결과서_RTMS-2026-0412.pdf',
}

export const PUBLIC_MEETING_CORPUS: MeetingCorpus = {
  base: BASE,
  basisByReference: BASIS,
  referenceName: REFERENCE_NAME,
}

export const simulatePublicMinutes = makeMeetingSimulator(PUBLIC_MEETING_CORPUS)

/** 명단에는 있지만 발언이 없는 사람과, 논의되지 않은 안건을 일부러 넣었다 */
export const PUBLIC_ATTENDEE_SAMPLE = [
  '김민준,부동산공시처',
  '윤서경,토지공시부',
  '정하윤,주택공시부',
  '서지호,정보화지원부',
].join('\n')

export const PUBLIC_AGENDA_SAMPLE = [
  '이의신청 처리 기한',
  '가격 균형 협의 기준',
  '조사 인력 배치 계획',
].join('\n')
