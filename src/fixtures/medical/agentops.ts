/**
 * 의료(새빛대학교병원) 에이전트 운영 실적.
 *
 * `areaIds`는 **이 팩의 지식 영역**을 가리킨다. 그래야 '기대는 영역에 못 찾는
 * 문서가 있다'는 판정이 성립한다.
 *
 * 급여 기준 영역에 못 찾는 문서가 있어 그 영역에 기대는 에이전트의 실패율이
 * 높다 — 기준이 안 잡히면 '그런 기준 없다'는 답이 나가고, 그 답을 믿고
 * 청구하면 삭감으로 돌아온다.
 */
import type { AgentOps } from '@entities/agentops/model'

const GPT = { modelId: 'm-gpt-oss', modelName: 'GPT-OSS-120B' }
const LLAMA = { modelId: 'm-llama-kor', modelName: 'Llama-3-Kor-Instruct' }

export const MEDICAL_AGENT_OPS: AgentOps[] = [
  { agentId: 'address', ...LLAMA, areaIds: ['k-suh-guide'], runs7d: 88, failed7d: 6, owner: '서지은 실장', exposed: true },
  { agentId: 'translate', ...LLAMA, areaIds: [], runs7d: 72, failed7d: 4, owner: '고윤성 팀장', exposed: true },
  { agentId: 'summary', ...GPT, areaIds: ['k-suh-guide', 'k-suh-notice'], runs7d: 214, failed7d: 9, owner: '서지은 실장', exposed: true },
  { agentId: 'review', ...GPT, areaIds: ['k-suh-guide'], runs7d: 96, failed7d: 5, owner: '고윤성 팀장', exposed: true },
  { agentId: 'chatbot', ...GPT, areaIds: ['k-suh-guide', 'k-suh-notice', 'k-suh-adjust'], runs7d: 1_024, failed7d: 41, owner: '서지은 실장', exposed: true },
  { agentId: 'report', ...GPT, areaIds: ['k-suh-adjust'], runs7d: 132, failed7d: 3, owner: '고윤성 팀장', exposed: true },
  { agentId: 'meeting', ...GPT, areaIds: [], runs7d: 52, failed7d: 2, owner: '문정아 수간호사', exposed: true },
  { agentId: 'knowledge', ...GPT, areaIds: ['k-suh-adjust', 'k-suh-safety'], runs7d: 288, failed7d: 5, owner: '서지은 실장', exposed: true },
  /* 급여 기준 영역에 못 찾는 문서 11건 — 실패율이 가장 높은 이유 */
  { agentId: 'internalreg', ...LLAMA, areaIds: ['k-suh-guide'], runs7d: 168, failed7d: 12, owner: '고윤성 팀장', exposed: true },
  { agentId: 'ocr', ...GPT, areaIds: [], runs7d: 146, failed7d: 7, owner: '고윤성 팀장', exposed: true },
  { agentId: 'dbquery', ...GPT, areaIds: ['k-suh-record'], runs7d: 118, failed7d: 4, owner: '하태경 센터장', exposed: true },
  { agentId: 'dataanalysis', ...GPT, areaIds: ['k-suh-record'], runs7d: 63, failed7d: 2, owner: '문정아 수간호사', exposed: true },
  { agentId: 'safety', ...GPT, areaIds: ['k-suh-safety'], runs7d: 34, failed7d: 1, owner: '문정아 수간호사', exposed: true },
]
