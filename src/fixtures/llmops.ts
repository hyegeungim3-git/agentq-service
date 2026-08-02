/**
 * LLM 운영 fixture.
 *
 * 세계관은 한빛정밀이다. 다른 fixture와 이어진다 — 검토 대상이 된 답변은
 * 실제로 사용자 포털이 내놓는 답변이고(금형 교체·출장 여비·수입검사),
 * 할루시네이션으로 판정된 건은 챗봇이 '근거를 못 찾겠다'고 답해야 했던 자리다.
 *
 * **안 잰 것은 `null`로 둔다.** 계약서 검토 파이프라인은 붙인 지 얼마 안 돼
 * 아직 측정하지 않았다. 0으로 두면 효과가 없는 것으로 읽힌다.
 */
import type {
  ConfidencePolicy,
  GuardrailRule,
  ModelEntry,
  QualityReview,
  RerankPipeline,
} from '@entities/llmops/model'

export const MODELS: ModelEntry[] = [
  {
    id: 'm-gpt-oss',
    name: 'GPT-OSS-120B',
    base: 'Meta-Llama-3-405B-Instruct',
    version: 'v2.4.1',
    state: 'running',
    stoppedReason: null,
    temperature: 0.3,
    contextTokens: 128_000,
    purpose: '사내 문서를 근거로 답하는 주 모델. 규정 검색·문서 요약·에이전트 업무에 쓴다.',
    usedBy: ['업무 챗봇', '문서 사전 검토', '문서 요약', '보고서 작성'],
    promptVersions: 3,
  },
  {
    id: 'm-llama-kor',
    name: 'Llama-3-Kor-Instruct',
    base: 'Meta-Llama-3-70B',
    version: 'v1.8.0',
    state: 'running',
    stoppedReason: null,
    temperature: 0.5,
    contextTokens: 8_000,
    purpose: '한국어 경량 모델. 빠른 응답이 필요한 단순 질의에 쓴다.',
    usedBy: ['내규·규정 조회', '기준정보 표준화'],
    promptVersions: 2,
  },
  {
    id: 'm-exaone',
    name: 'EXAONE-3.0-7.8B',
    base: 'LG-EXAONE-3.0-7.8B',
    version: 'v1.3.2',
    state: 'running',
    stoppedReason: null,
    temperature: 0.6,
    contextTokens: 32_000,
    purpose: '저지연 실시간 응답용 경량 모델.',
    usedBy: ['문서 번역'],
    promptVersions: 1,
  },
  {
    id: 'm-solar',
    name: 'Solar-10.7B-v1.0',
    base: 'Upstage-Solar-Pro-10.7B',
    version: 'v1.0.0',
    state: 'stopped',
    /* 껐으면 왜 껐는지 남긴다 — 없으면 다시 켜도 되는지 아무도 모른다 */
    stoppedReason:
      '2026-06 평가에서 수치 인용 오류가 반복돼 중지했습니다(표본 120건 중 9건). 재도입은 평가 재실행 뒤에 결정합니다.',
    temperature: 0.5,
    contextTokens: 4_000,
    purpose: '평가 후 재도입 검토 중.',
    usedBy: [],
    promptVersions: 0,
  },
]

export const PIPELINES: RerankPipeline[] = [
  { id: 'p-01', agentLabel: '업무 챗봇', model: 'BGE-Reranker-v2', topK: 5, threshold: 0.7, enabled: true, measurement: { gain: 0.184, samples: 420, measuredOn: '2026-07-20' } },
  { id: 'p-02', agentLabel: '내규·규정 조회', model: 'Cross-Encoder-KoE5', topK: 3, threshold: 0.75, enabled: true, measurement: { gain: 0.121, samples: 260, measuredOn: '2026-07-20' } },
  { id: 'p-03', agentLabel: '지식 검색', model: 'BGE-Reranker-v2', topK: 5, threshold: 0.65, enabled: true, measurement: { gain: 0.098, samples: 310, measuredOn: '2026-07-13' } },
  /* 붙인 지 얼마 안 돼 아직 안 쟀다. 0으로 두면 효과가 없는 것으로 읽힌다 */
  { id: 'p-04', agentLabel: '문서 사전 검토', model: 'ColBERT-v2-Kor', topK: 8, threshold: 0.8, enabled: true, measurement: { gain: null, samples: null, measuredOn: null } },
  { id: 'p-05', agentLabel: '데이터 조회', model: 'BGE-Reranker-v2', topK: 5, threshold: 0.85, enabled: false, measurement: { gain: 0.223, samples: 180, measuredOn: '2026-06-29' } },
  { id: 'p-06', agentLabel: '문서 요약', model: 'Cross-Encoder-KoE5', topK: 4, threshold: 0.68, enabled: true, measurement: { gain: 0.075, samples: 150, measuredOn: '2026-07-06' } },
]

/* 껐을 때 무엇이 통과하게 되는지 적는다 — 끄기 전에 알아야 한다 */
export const GUARDRAILS: GuardrailRule[] = [
  { id: 'g-01', name: '개인정보 마스킹', description: '주민등록번호·연락처·계좌번호를 답변에서 가린다', enabled: true, hits: 34, riskIfOff: '문서에 있던 개인정보가 답변에 그대로 실려 나갑니다.' },
  { id: 'g-02', name: '보안 등급 차단', description: '대외비 문서 본문을 등급이 낮은 계정에 노출하지 않는다', enabled: true, hits: 12, riskIfOff: '협력사 계정이 대외비 작업표준 본문을 받게 됩니다.' },
  { id: 'g-03', name: '근거 없는 답변 차단', description: '출처를 못 찾으면 답을 만들지 않고 모른다고 답한다', enabled: true, hits: 21, riskIfOff: '모르는 질문에 그럴듯한 답을 지어내게 됩니다.' },
  { id: 'g-04', name: '수치 인용 검증', description: '문서에 없는 수치를 답변에 쓰지 않는다', enabled: true, hits: 9, riskIfOff: '경도·타수 같은 수치가 문서와 다르게 나갈 수 있습니다.' },
  { id: 'g-05', name: '외부 링크 차단', description: '사내 문서가 아닌 출처를 근거로 제시하지 않는다', enabled: true, hits: 5, riskIfOff: '사내 기준이 아닌 인터넷 정보가 근거로 붙습니다.' },
  { id: 'g-06', name: '유해 표현 필터', description: '차별·비하 표현을 걸러낸다', enabled: true, hits: 2, riskIfOff: '부적절한 표현이 그대로 나갈 수 있습니다.' },
  /* 꺼져 있는 규칙 — 껐다는 사실과 그 대가를 함께 보여 준다 */
  { id: 'g-07', name: '답변 길이 제한', description: '답변을 1,200자 이내로 자른다', enabled: false, hits: 0, riskIfOff: '긴 답변이 그대로 나갑니다. 지금은 요약을 사람이 판단하도록 일부러 꺼 두었습니다.' },
]

export const REVIEWS: QualityReview[] = [
  { id: 'r-01', agentLabel: '업무 챗봇', reviewedOn: '2026-07-30', question: '금형 교체 주기가 어떻게 되나요?', answer: '금형 교체 기준은 타수 50만 타입니다…', confidence: 0.94, verdict: 'accurate', note: '작업표준 조항을 정확히 인용했습니다.', reviewer: '박태윤' },
  { id: 'r-02', agentLabel: '내규·규정 조회', reviewedOn: '2026-07-29', question: '출장 여비 기준 알려줘', answer: '국내 출장 여비는 일 60,000원 기준 실비 정산입니다…', confidence: 0.72, verdict: 'needsFix', note: '해외 출장 기준이 빠졌습니다. 질문 범위를 되묻도록 고쳐야 합니다.', reviewer: '서민아' },
  { id: 'r-03', agentLabel: '문서 인식(OCR)', reviewedOn: '2026-07-28', question: '수입검사 판정 기준이 무엇인가요?', answer: '경도 하한 58.0 HRC, 두께 편차 ±0.05mm…', confidence: 0.78, verdict: 'accurate', note: null, reviewer: '정하늘' },
  /* 챗봇이 '근거를 못 찾겠다'고 답해야 했던 자리 */
  { id: 'r-04', agentLabel: '업무 챗봇', reviewedOn: '2026-07-27', question: '창원 공장 비상 대피 경로 알려줘', answer: '창원본사 3동 기준 비상 대피 경로는 서편 계단…', confidence: 0.55, verdict: 'hallucination', note: '대피도 문서가 지식베이스에 없습니다. 모른다고 답했어야 합니다.', reviewer: '오세진' },
  { id: 'r-05', agentLabel: '문서 사전 검토', reviewedOn: '2026-07-25', question: '수의계약 한도액 기준', answer: '추정가격 2천만원 이하인 경우…', confidence: 0.82, verdict: 'needsFix', note: '사내 규정 한도액과 다릅니다. 사내 문서를 우선 인용하도록 고쳐야 합니다.', reviewer: '박태윤' },
]

export const CONFIDENCE_POLICY: ConfidencePolicy = {
  autoAnswerThreshold: 0.8,
  belowAction:
    '답변에 원문 확인 권장 표시를 붙이고, 판단 근거 패널을 펼친 상태로 보여 줍니다. 답변 자체를 막지는 않습니다.',
}
