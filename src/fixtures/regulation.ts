/**
 * 내규 조회 fixture.
 *
 * 질문 키워드로 답을 고른다. 매칭이 안 되면 '모른다'를 반환해야 하며
 * 그럴듯한 답을 지어내지 않는다 — 규정 조회에서 지어낸 답은 사고로 이어진다.
 *
 * 개정일이 오래된 근거를 하나 섞었다. 화면이 '오래된 근거' 표시를 하는지
 * 확인할 수 있어야 하기 때문이다.
 */
import type { RegulationAnswer, RegulationCategory } from '@entities/regulation/model'

export type RegulationEntry = {
  keywords: string[]
  categories: RegulationCategory[]
  answer: RegulationAnswer
}

export const REGULATION_ENTRIES: RegulationEntry[] = [
  {
    keywords: ['출장', '여비', '정산'],
    categories: ['labor'],
    answer: {
      question: '',
      answer:
        '국내 출장 여비는 일 60,000원을 기준으로 실비 정산합니다. 기준액을 초과하려면 출장 전 부서장 승인을 받아야 하며, 승인 없이 초과 계상하면 정산이 반려됩니다. 숙박이 포함되면 영수증을 반드시 첨부합니다.',
      citations: [
        {
          clause: '취업규칙 제23조 제2항',
          text: '국내 출장 시 여비는 1일 60,000원을 기준으로 하되, 실비가 이를 초과하는 경우 사전에 부서장의 승인을 받아야 한다.',
          revisedOn: '2025-07-01',
        },
        {
          clause: '취업규칙 제23조 제4항',
          text: '숙박비를 청구하는 경우 숙박 영수증을 첨부하여야 한다.',
          revisedOn: '2025-07-01',
        },
      ],
      related: ['복무규정 제11조 (출장 신청 절차)'],
      elapsedSeconds: 3.2,
    },
  },
  {
    keywords: ['금형', '교체', '주기', '수명'],
    categories: ['safety'],
    answer: {
      question: '',
      answer:
        '금형 교체 기준은 타수 50만 타입니다. 다만 타수에 도달하지 않았더라도 버 발생이 관리 기준을 초과하면 교체해야 합니다. 교체 작업은 2인 1조로 수행하고 교체 후 초품 검사를 실시하며, 이력은 설비 대장에 기록합니다.',
      citations: [
        {
          clause: '프레스 작업표준 SOP-PR-011 제4장',
          text: '타수 50만 타를 교체 기준으로 하며, 타수 도달 전이라도 버 발생이 관리 기준을 초과하면 교체한다.',
          revisedOn: '2024-11-15',
        },
        {
          clause: '안전보건관리규정 제17조',
          text: '금형 교체 작업은 2인 1조로 수행하고 크레인 작업 구간에는 통제선을 설치한다.',
          revisedOn: '2022-03-10', // 3년 이상 지난 근거 — 화면이 '오래됨'으로 표시해야 한다
        },
      ],
      related: ['품질경영매뉴얼 8.5.1 (초품 검사)'],
      elapsedSeconds: 3.8,
    },
  },
  {
    keywords: ['개인정보', '협력사', '연락처', '마스킹'],
    categories: ['security'],
    answer: {
      question: '',
      answer:
        '협력사 담당자의 개인 연락처는 업무상 필요한 최소 범위로만 수집하며, 사내 문서에 첨부할 때는 대표번호로 대체하거나 마스킹 처리합니다. 제3자 제공이 필요하면 사전 동의를 받아야 합니다.',
      citations: [
        {
          clause: '개인정보처리방침 제3조',
          text: '개인정보를 제3자에게 제공하는 경우 정보주체의 사전 동의를 받아야 한다.',
          revisedOn: '2025-01-20',
        },
      ],
      related: ['보안정책 제15조 (문서 외부 반출)'],
      elapsedSeconds: 2.9,
    },
  },
]

/** 매칭 실패 시 — 지어내지 않고 모른다고 답한다 */
export const NO_MATCH_ANSWER: RegulationAnswer = {
  question: '',
  answer:
    '해당 질문에 직접 대응하는 규정 조항을 찾지 못했습니다. 지어낸 답을 드리지 않기 위해 결과를 비워 둡니다. 질문을 구체화하시거나 담당 부서에 문의하십시오.',
  citations: [],
  related: [],
  elapsedSeconds: 2.1,
}
