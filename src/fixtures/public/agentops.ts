/**
 * 공공(한국부동산원) 에이전트 운영 실적.
 *
 * `areaIds`는 **이 팩의 지식 영역**을 가리킨다. 그래야 '이 에이전트가 기대는
 * 영역에 못 찾는 문서가 있다'는 판정이 성립한다 — 영역이 다른 발주처 것이면
 * 판정이 조용히 빈 값이 되고, 화면은 '빈틈 없음'이라고 말하게 된다.
 *
 * 도입한 11종만 있다. 실패율이 높은 것은 조사지침 영역에 못 찾는 문서가 있는
 * 에이전트들이다 — 원인은 에이전트가 아니라 그 아래 데이터다.
 */
import type { AgentOps } from '@entities/agentops/model'

const GPT = { modelId: 'm-gpt-oss', modelName: 'GPT-OSS-120B' }
const LLAMA = { modelId: 'm-llama-kor', modelName: 'Llama-3-Kor-Instruct' }

export const PUBLIC_AGENT_OPS: AgentOps[] = [
  { agentId: 'address', ...LLAMA, areaIds: ['k-reb-parcel'], runs7d: 46, failed7d: 3, owner: '윤서경 차장', exposed: true },
  { agentId: 'translate', ...LLAMA, areaIds: [], runs7d: 34, failed7d: 2, owner: '서지호 차장', exposed: true },
  { agentId: 'summary', ...GPT, areaIds: ['k-reb-guide', 'k-reb-law'], runs7d: 168, failed7d: 6, owner: '윤서경 차장', exposed: true },
  { agentId: 'review', ...GPT, areaIds: ['k-reb-guide'], runs7d: 121, failed7d: 5, owner: '김민준 부장', exposed: true },
  { agentId: 'chatbot', ...GPT, areaIds: ['k-reb-guide', 'k-reb-law', 'k-reb-appeal'], runs7d: 690, failed7d: 24, owner: '서지호 차장', exposed: true },
  { agentId: 'report', ...GPT, areaIds: ['k-reb-parcel'], runs7d: 96, failed7d: 2, owner: '정하윤 과장', exposed: true },
  { agentId: 'meeting', ...GPT, areaIds: [], runs7d: 41, failed7d: 2, owner: '서지호 차장', exposed: true },
  { agentId: 'knowledge', ...GPT, areaIds: ['k-reb-parcel', 'k-reb-appeal'], runs7d: 233, failed7d: 4, owner: '윤서경 차장', exposed: true },
  { agentId: 'internalreg', ...LLAMA, areaIds: ['k-reb-guide', 'k-reb-law'], runs7d: 152, failed7d: 7, owner: '김민준 부장', exposed: true },
  { agentId: 'ocr', ...GPT, areaIds: [], runs7d: 88, failed7d: 5, owner: '정하윤 과장', exposed: true },
  { agentId: 'dbquery', ...GPT, areaIds: ['k-reb-rtms'], runs7d: 74, failed7d: 3, owner: '서지호 차장', exposed: true },
  { agentId: 'dataanalysis', ...GPT, areaIds: ['k-reb-parcel'], runs7d: 52, failed7d: 2, owner: '윤서경 차장', exposed: true },
  { agentId: 'safety', ...GPT, areaIds: ['k-reb-guide'], runs7d: 18, failed7d: 3, owner: '정하윤 과장', exposed: true },
]
